package dtos

type CreateEventDTO struct {
	Title       string `json:"title" binding:"required"`
	Type        string `json:"type" binding:"required"`
	Location    string `json:"location" binding:"required"`
	StartTime   string `json:"start_time" binding:"required"`
	EndTime     string `json:"end_time" binding:"required"`
	Capacity    int    `json:"capacity" binding:"required"`
	Description string `json:"description"`
	ImgUrl      string `json:"img_url"`
}

type UpdateEventDTO struct {
	Title       *string `json:"title"`
	Type        *string `json:"type"`
	Location    *string `json:"location"`
	StartTime   *string `json:"start_time"`
	EndTime     *string `json:"end_time"`
	Capacity    *int    `json:"capacity"`
	Description *string `json:"description"`
	ImgURL      *string `json:"img_url"`
}

type EventFilterDTO struct {
	Type      string `form:"type"`
	Location  string `form:"location"`
	StartDate string `form:"start_time"`
	EndDate   string `form:"end_time"`
	Search    string `form:"search"`
}

type ApproveEventDTO struct {
	Status string `json:"status" binding:"required"`
}