package dtos

import "github.com/mubarik/EVENT_MANBAGEMENT_SYSTEM/models"

type CreateUserdto struct {
	Name         string      `json:"name" binding:"required"`
	Email        string      `json:"email" binding:"required,email"`
	Password     string      `json:"password" binding:"required,min=8,max=128"`
	Is2FAEnabled bool        `json:"Is2faEnabled"`
	Role         models.Role `json:"role" binding:"required,oneof=ADMIN ORGANIZER STAFF"`
}

type CreateLogindto struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8,max=128"`
}

type LoginUserResponse struct {
	AccessToken  string      `json:"access_token"`
	RefreshToken string      `json:"refresh_token"`
	User         models.User `json:"user"`
}

type ResetPasswordByAdminDTO struct {
	UserID      int    `json:"user_id" binding:"required"`
	NewPassword string `json:"new_password" binding:"required,min=6"`
}

type ForgotPasswordDTO struct {
	Email string `json:"email" binding:"required,email"`
}

type ResetPasswordDTO struct {
	UserID      uint   `json:"user_id"`
	Email       string `json:"email" binding:"required,email"`
	OTP         string `json:"otp" binding:"required,len=6"`
	NewPassword string `json:"new_password" binding:"required,min=6"`
}
