package services

import (
	"errors"
	"log/slog"
	"net/http"
	"strings"
	"time"

	"github.com/pquerna/otp/totp"
	"golang.org/x/crypto/bcrypt"

	"github.com/mubarik/EVENT_MANBAGEMENT_SYSTEM/constants"
	"github.com/mubarik/EVENT_MANBAGEMENT_SYSTEM/dtos"
	"github.com/mubarik/EVENT_MANBAGEMENT_SYSTEM/helpers"
	"github.com/mubarik/EVENT_MANBAGEMENT_SYSTEM/models"
	"github.com/mubarik/EVENT_MANBAGEMENT_SYSTEM/repository"
)

type UserService struct {
	Repo *repository.UserRepo
}

func NewUserService(repo *repository.UserRepo) *UserService {
	return &UserService{Repo: repo}
}

// CREATE USER
func (svc *UserService) CreateUser(data *dtos.CreateUserdto) (int, error) {
	email := strings.ToLower(data.Email)

	_, err := svc.Repo.GetUserByEmail(email)
	if err == nil {
		return http.StatusConflict, errors.New("user already exists")
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(data.Password), bcrypt.DefaultCost)
	if err != nil {
		return http.StatusInternalServerError, errors.New(constants.DefaultErrorMsg)
	}

	err = svc.Repo.CreateUser(models.User{
		Name:         data.Name,
		Email:        email,
		Password:     string(hash),
		Role:         data.Role,
		Is2FAEnabled: data.Is2FAEnabled,
	})
	if err != nil {
		return http.StatusInternalServerError, errors.New("failed to create user")
	}

	return http.StatusCreated, nil
}

// LOGIN
func (svc *UserService) LoginUser(data *dtos.CreateLogindto) (dtos.LoginUserResponse, int, error) {
	email := strings.ToLower(data.Email)

	user, err := svc.Repo.GetUserByEmail(email)
	if err != nil {
		return dtos.LoginUserResponse{}, http.StatusUnauthorized, errors.New("invalid credentials")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(data.Password)); err != nil {
		return dtos.LoginUserResponse{}, http.StatusUnauthorized, errors.New("invalid credentials")
	}

	// 1. If 2FA is enabled, trigger Email OTP and stop here
	if user.Is2FAEnabled {
		otp := helpers.GenerateNumericOTP(6)

		// Save OTP to DB (using your existing PasswordResetToken logic)
		reset := models.PasswordResetToken{
			Email:     user.Email,
			Token:     otp,
			ExpiresAt: time.Now().Add(5 * time.Minute),
		}
		svc.Repo.SaveResetToken(reset)

		// Send the OTP via Email
		_ = helpers.SendOTPEmail(user.Email, otp)

		// Return user info but NO tokens yet
		return dtos.LoginUserResponse{
			User: user,
		}, http.StatusAccepted, errors.New("2FA_REQUIRED")
	}

	// 2. If 2FA is disabled, return tokens immediately
	access, _ := helpers.GenerateJwt(user.Role, user.ID, user.Email, time.Now().Add(30*time.Minute).Unix(), false)
	refresh, _ := helpers.GenerateJwt(user.Role, user.ID, user.Email, time.Now().Add(72*time.Hour).Unix(), true)

	return dtos.LoginUserResponse{
		User:         user,
		AccessToken:  access,
		RefreshToken: refresh,
	}, http.StatusOK, nil
}

// VERIFY 2FA LOGIN (Step 2 of Login)
func (svc *UserService) Verify2FALogin(email string, otp string) (dtos.LoginUserResponse, int, error) {
	// 1. Validate the OTP
	record, err := svc.Repo.GetResetTokenByEmailAndOTP(email, otp)
	if err != nil {
		return dtos.LoginUserResponse{}, http.StatusUnauthorized, errors.New("invalid otp")
	}

	if time.Now().After(record.ExpiresAt) {
		return dtos.LoginUserResponse{}, http.StatusUnauthorized, errors.New("otp expired")
	}

	// 2. OTP is valid, get the user to generate tokens
	user, err := svc.Repo.GetUserByEmail(email)
	if err != nil {
		return dtos.LoginUserResponse{}, http.StatusUnauthorized, errors.New("unauthorized")
	}

	// 3. Clean up the used token
	_ = svc.Repo.DeleteResetToken(otp)

	// 4. Generate Tokens
	access, _ := helpers.GenerateJwt(user.Role, user.ID, user.Email, time.Now().Add(30*time.Minute).Unix(), false)
	refresh, _ := helpers.GenerateJwt(user.Role, user.ID, user.Email, time.Now().Add(72*time.Hour).Unix(), true)

	return dtos.LoginUserResponse{
		User:         user,
		AccessToken:  access,
		RefreshToken: refresh,
	}, http.StatusOK, nil
}

// FORGOT PASSWORD (OTP via Email)
func (svc *UserService) ForgotPassword(data *dtos.ForgotPasswordDTO) (int, error) {
	email := strings.ToLower(data.Email)

	_, err := svc.Repo.GetUserByEmail(email)
	if err != nil {
		return http.StatusOK, nil // User not found, but we don't tell the client
	}

	otp := helpers.GenerateNumericOTP(6)

	// Save to DB
	reset := models.PasswordResetToken{
		Email:     email,
		Token:     otp,
		ExpiresAt: time.Now().Add(10 * time.Minute),
	}
	svc.Repo.SaveResetToken(reset)

	err = helpers.SendOTPEmail(email, otp)
	if err != nil {
		slog.Error("Failed to send email", "error", err)
		return http.StatusInternalServerError, errors.New("failed to send otp email")
	}

	return http.StatusOK, nil
}

func (svc *UserService) ResetPassword(data *dtos.ResetPasswordDTO) (int, error) {
	// 1. Look for the OTP in the PasswordResetToken table (Email OTP)
	record, err := svc.Repo.GetResetTokenByEmailAndOTP(data.Email, data.OTP)
	if err != nil {
		return http.StatusBadRequest, errors.New("invalid otp or email")
	}

	if time.Now().After(record.ExpiresAt) {
		return http.StatusBadRequest, errors.New("otp expired")
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(data.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		return http.StatusInternalServerError, err
	}

	user, _ := svc.Repo.GetUserByEmail(data.Email)
	if err := svc.Repo.UpdatePasswordById(user.ID, string(hash)); err != nil {
		return http.StatusInternalServerError, err
	}

	_ = svc.Repo.DeleteResetToken(data.OTP)

	return http.StatusOK, nil
}

// ADMIN RESET PASSWORD
func (svc *UserService) ResetPasswordByAdmin(adminEmail string, data *dtos.ResetPasswordDTO) (int, error) {
	slog.Info("Admin initiated password reset", "admin", adminEmail, "target_user_id", data.UserID)

	_, err := svc.Repo.GetUserbyId(data.UserID)
	if err != nil {
		return http.StatusNotFound, errors.New("user not found")
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(data.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		return http.StatusInternalServerError, err
	}

	if err := svc.Repo.UpdatePasswordById(data.UserID, string(hash)); err != nil {
		return http.StatusInternalServerError, err
	}

	return http.StatusOK, nil
}

// 2FA METHODS
func (svc *UserService) Verify2FA(email string, code string) (dtos.LoginUserResponse, int, error) {
	user, err := svc.Repo.GetUserByEmail(email)
	if err != nil {
		return dtos.LoginUserResponse{}, http.StatusUnauthorized, errors.New("unauthorized")
	}

	if !totp.Validate(code, user.TwoFASecret) {
		return dtos.LoginUserResponse{}, http.StatusUnauthorized, errors.New("invalid 2fa code")
	}

	access, _ := helpers.GenerateJwt(user.Role, user.ID, user.Email, time.Now().Add(30*time.Minute).Unix(), false)
	refresh, _ := helpers.GenerateJwt(user.Role, user.ID, user.Email, time.Now().Add(72*time.Hour).Unix(), true)

	return dtos.LoginUserResponse{
		User:         user,
		AccessToken:  access,
		RefreshToken: refresh,
	}, http.StatusOK, nil
}

func (svc *UserService) Generate2FA(email string) (string, string, error) {
	key, err := totp.Generate(totp.GenerateOpts{
		Issuer:      "EventApp",
		AccountName: email,
	})
	if err != nil {
		return "", "", err
	}
	return key.Secret(), key.URL(), nil
}

func (svc *UserService) Enable2FA(email string, code string, secret string) error {
	if !totp.Validate(code, secret) {
		return errors.New("invalid 2fa code")
	}
	user, err := svc.Repo.GetUserByEmail(email)
	if err != nil {
		return err
	}
	user.Is2FAEnabled = true
	user.TwoFASecret = secret
	return svc.Repo.DB.Save(&user).Error
}

// GETTERS
func (svc *UserService) GetAllUsers() (int, []models.User, error) {
	data, err := svc.Repo.GetAllusers()
	return http.StatusOK, data, err
}

func (svc *UserService) GetUserById(id uint) (int, models.User, error) {
	data, err := svc.Repo.GetUserbyId(id)
	if err != nil {
		return http.StatusNotFound, models.User{}, errors.New("user not found")
	}
	return http.StatusOK, data, nil
}

func (svc *UserService) WhoAmI(email string) (*models.User, int, error) {
	user, err := svc.Repo.GetUserByEmail(strings.ToLower(email))
	if err != nil {
		return nil, http.StatusNotFound, errors.New("user not found")
	}
	return &user, http.StatusOK, nil
}

func (svc *UserService) RefreshToken(email string) (*dtos.LoginUserResponse, int, error) {
	user, err := svc.Repo.GetUserByEmail(email)
	if err != nil {
		return nil, http.StatusUnauthorized, errors.New("unauthorized")
	}
	access, _ := helpers.GenerateJwt(user.Role, user.ID, user.Email, time.Now().Add(30*time.Minute).Unix(), false)
	refresh, _ := helpers.GenerateJwt(user.Role, user.ID, user.Email, time.Now().Add(72*time.Hour).Unix(), true)
	return &dtos.LoginUserResponse{User: user, AccessToken: access, RefreshToken: refresh}, http.StatusOK, nil
}
