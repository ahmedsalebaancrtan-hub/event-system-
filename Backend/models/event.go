package models

import "time"

type EventType string

const (
	EventTypeSeminar    EventType = "SEMINAR"
	EventTypeWorkshop   EventType = "WORKSHOP"
	EventTypeConference EventType = "CONFERENCE"
)

type Event struct {
	ID          uint       `json:"id"`
	Title       string     `json:"title"`
	Type        string     `json:"type"`
	Location    string     `json:"location"`
	StartTime   time.Time  `json:"startTime"`
	EndTime     time.Time  `json:"endTime"`
	Capacity    int        `json:"capacity"`
	Description string     `json:"description"`
	ImgUrl      string     `json:"imgUrl"`
	Status      string     `json:"status" gorm:"size:20;default:'pending'"`
	ReviewedBy  *uint      `json:"reviewedBy"`
	ReviewedAt  *time.Time `json:"ReviewedAt"`
	CreatedAt   time.Time  `json:"createdAt"`
	UpdatedAt   time.Time  `json:"updatedAt"`
}
