package models

import "time"

type PasswordResetToken struct {
	ID        uint
	Email     string
	Token     string
	ExpiresAt time.Time
	CreatedAt time.Time
	
}
