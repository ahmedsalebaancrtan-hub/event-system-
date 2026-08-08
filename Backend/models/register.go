package models

import "time"

type EventRegistration struct {
	ID        uint      `json:"id"`
	EventID   uint      `json:"event_id" gorm:"not null;uniqueIndex:idx_user_event"`
	UserID    uint      `json:"user_id" gorm:"not null;uniqueIndex:idx_user_event"`
	Status    string    `json:"status" gorm:"default:'registered'"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"Updated_at"`
	Event     Event      `json:"event" gorm:"foreignkey:EventID"`
	User      User      `json:"user" gorm:"foreignkey:UserID"`
}
