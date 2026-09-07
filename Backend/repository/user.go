package repository

import (
	"errors"

	"github.com/mubarik/EVENT_MANBAGEMENT_SYSTEM/dtos"
	"github.com/mubarik/EVENT_MANBAGEMENT_SYSTEM/models"
	"gorm.io/gorm"
)

type UserRepo struct {
	DB *gorm.DB
}

func RegisterRepo(db *gorm.DB) *UserRepo {
	return &UserRepo{DB: db}
}

func (r *UserRepo) CreateUser(data models.User) error {
	return r.DB.Create(&data).Error
}

func (r *UserRepo) GetUserByEmail(email string) (models.User, error) {
	var user models.User
	err := r.DB.Where("email = ?", email).First(&user).Error
	return user, err
}

func (r *UserRepo) GetAllusers(filter dtos.UserFilterDTO, limit, offset int) ([]models.User, int64, error) {
	var users []models.User
	var total int64
	query := r.DB.Model(&models.User{})

	if filter.Role != "" && filter.Role != "ALL" {
		query = query.Where("role = ?", filter.Role)
	}
	if filter.Search != "" {
		query = query.Where("LOWER(name) LIKE LOWER(?) OR LOWER(email) LIKE LOWER(?)", "%"+filter.Search+"%", "%"+filter.Search+"%")
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	err := query.Limit(limit).Offset(offset).Find(&users).Error
	return users, total, err
}

func (r *UserRepo) GetUserbyId(id uint) (models.User, error) {
	var user models.User
	err := r.DB.First(&user, id).Error
	return user, err
}

func (r *UserRepo) UpdatePasswordById(id uint, hashedpassword string) error {
	result := r.DB.Model(&models.User{}).Where("id = ?", id).Update("password", hashedpassword)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return errors.New("user not found")
	}
	return nil
}

// --- OTP / Reset Token Logic ---

func (r *UserRepo) SaveResetToken(data models.PasswordResetToken) error {

	r.DB.Where("email = ?", data.Email).Delete(&models.PasswordResetToken{})
	return r.DB.Create(&data).Error
}

func (r *UserRepo) GetResetTokenByEmailAndOTP(email string, otp string) (models.PasswordResetToken, error) {
	var record models.PasswordResetToken

	err := r.DB.Where("email = ? AND token = ?", email, otp).First(&record).Error
	return record, err
}

func (r *UserRepo) GetResetToken(token string) (models.PasswordResetToken, error) {
	var record models.PasswordResetToken
	err := r.DB.Where("token = ?", token).First(&record).Error
	return record, err
}

func (r *UserRepo) DeleteResetToken(token string) error {
	return r.DB.Where("token = ?", token).Delete(&models.PasswordResetToken{}).Error
}
