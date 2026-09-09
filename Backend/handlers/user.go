package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/mubarik/EVENT_MANBAGEMENT_SYSTEM/dtos"
	"github.com/mubarik/EVENT_MANBAGEMENT_SYSTEM/infra"
	"github.com/mubarik/EVENT_MANBAGEMENT_SYSTEM/repository"
	"github.com/mubarik/EVENT_MANBAGEMENT_SYSTEM/services"
)

type UserHandler struct {
	Usersvc *services.UserService
}

func RegisterUserHandler() *UserHandler {
	userRepo := repository.RegisterRepo(infra.DB)
	usersvc := services.NewUserService(userRepo)
	return &UserHandler{Usersvc: usersvc}
}

func (h *UserHandler) CreateUser(c *gin.Context) {
	var body dtos.CreateUserdto
	if err := c.ShouldBindJSON(&body); err != nil {
		fail(c, http.StatusBadRequest, err.Error())
		return
	}
	status, err := h.Usersvc.CreateUser(&body)
	if err != nil {
		fail(c, status, err.Error())
		return
	}
	ok(c, status, "User Created successfully", nil)
}

func (h *UserHandler) LoginUser(c *gin.Context) {
	var req dtos.CreateLogindto
	if err := c.ShouldBindJSON(&req); err != nil {
		fail(c, http.StatusBadRequest, err.Error())
		return
	}
	response, statusCode, err := h.Usersvc.LoginUser(&req)
	if err != nil {
		fail(c, statusCode, err.Error())
		return
	}
	ok(c, statusCode, "Login successful", response)
}

func (h *UserHandler) ForgotPassword(c *gin.Context) {
	var body dtos.ForgotPasswordDTO
	if err := c.ShouldBindJSON(&body); err != nil {
		fail(c, http.StatusBadRequest, err.Error())
		return
	}
	status, _ := h.Usersvc.ForgotPassword(&body)
	ok(c, status, "If email exists, an OTP has been sent.", nil)
}

func (h *UserHandler) ResetPassword(c *gin.Context) {
	var body dtos.ResetPasswordDTO
	if err := c.ShouldBindJSON(&body); err != nil {
		fail(c, http.StatusBadRequest, err.Error())
		return
	}
	status, err := h.Usersvc.ResetPassword(&body)
	if err != nil {
		fail(c, status, err.Error())
		return
	}
	ok(c, status, "Password updated successfully using Email OTP", nil)
}

func (h *UserHandler) GetAllUsers(c *gin.Context) {
	var filter dtos.UserFilterDTO
	if err := c.ShouldBindQuery(&filter); err != nil {
		fail(c, http.StatusBadRequest, err.Error())
		return
	}
	status, data, total, err := h.Usersvc.GetAllUsers(filter)
	if err != nil {
		fail(c, status, err.Error())
		return
	}
	page, limit, _ := dtos.ResolvePagination(filter.Page, filter.Limit, 10)
	meta := dtos.BuildMeta(page, limit, total)
	okPaginated(c, status, "Users fetched successfully", data, meta)
}

func (h *UserHandler) GetUserById(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("userId"))
	if err != nil {
		fail(c, http.StatusBadRequest, "invalid id")
		return
	}
	status, user, err := h.Usersvc.GetUserById(uint(id))
	if err != nil {
		fail(c, status, err.Error())
		return
	}
	ok(c, status, "User fetched successfully", user)
}

func (h *UserHandler) WhoAmI(c *gin.Context) {
	email := c.GetString("email")
	user, status, err := h.Usersvc.WhoAmI(email)
	if err != nil {
		fail(c, status, err.Error())
		return
	}
	c.JSON(status, gin.H{"success": true, "user": user})
}

func (h *UserHandler) ResetPasswordByAdmin(c *gin.Context) {
	var body dtos.ResetPasswordDTO
	if err := c.ShouldBindJSON(&body); err != nil {
		fail(c, http.StatusBadRequest, err.Error())
		return
	}
	adminEmail := c.GetString("email")
	status, err := h.Usersvc.ResetPasswordByAdmin(adminEmail, &body)
	if err != nil {
		fail(c, status, err.Error())
		return
	}
	ok(c, status, "password reset by admin successfully", nil)
}

// ── 2FA Handlers ────────────────────────────────────────────────

func (h *UserHandler) Generate2FA(c *gin.Context) {
	email := c.GetString("email")
	secret, url, err := h.Usersvc.Generate2FA(email)
	if err != nil {
		fail(c, http.StatusInternalServerError, err.Error())
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"success":     true,
		"message":     "2FA generated successfully",
		"qr_url":      url,
		"temp_secret": secret,
	})
}

func (h *UserHandler) Enable2FA(c *gin.Context) {
	email := c.GetString("email")
	var body struct {
		Code   string `json:"code"`
		Secret string `json:"secret"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		fail(c, http.StatusBadRequest, err.Error())
		return
	}
	if err := h.Usersvc.Enable2FA(email, body.Code, body.Secret); err != nil {
		fail(c, http.StatusBadRequest, err.Error())
		return
	}
	ok(c, http.StatusOK, "2FA enabled successfully", nil)
}

func (h *UserHandler) Verify2FA(c *gin.Context) {
	email := c.GetString("email")
	var body struct {
		Code string `json:"code"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		fail(c, http.StatusBadRequest, err.Error())
		return
	}
	resp, status, err := h.Usersvc.Verify2FA(email, body.Code)
	if err != nil {
		fail(c, status, err.Error())
		return
	}
	ok(c, status, "2FA verified successfully", resp)
}

func (h *UserHandler) RefreshToken(c *gin.Context) {
	email, exists := c.Get("email")
	if !exists {
		fail(c, http.StatusUnauthorized, "Unauthorized: No email found in context")
		return
	}
	response, statusCode, err := h.Usersvc.RefreshToken(email.(string))
	if err != nil {
		fail(c, statusCode, err.Error())
		return
	}
	ok(c, statusCode, "Token refreshed successfully!", response)
}

func (h *UserHandler) Verify2FALogin(c *gin.Context) {
	var body struct {
		Email string `json:"email"`
		OTP   string `json:"otp"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		fail(c, http.StatusBadRequest, "Email and OTP are required")
		return
	}
	response, statusCode, err := h.Usersvc.Verify2FALogin(body.Email, body.OTP)
	if err != nil {
		fail(c, statusCode, err.Error())
		return
	}
	ok(c, statusCode, "2FA Verification successful", response)
}
