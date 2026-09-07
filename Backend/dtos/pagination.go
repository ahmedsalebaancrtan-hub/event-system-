package dtos

// PaginationDTO holds page and limit query params for any list endpoint.
type PaginationDTO struct {
	Page  int `form:"page"`
	Limit int `form:"limit"`
}

// PaginationMeta is the computed pagination metadata returned to the client.
type PaginationMeta struct {
	CurrentPage  int   `json:"current_page"`
	PerPage      int   `json:"per_page"`
	TotalRecords int64 `json:"total_records"`
	TotalPages   int   `json:"total_pages"`
	HasNext      bool  `json:"has_next"`
	HasPrev      bool  `json:"has_prev"`
}

// ResolvePagination applies defaults and computes offset.
// defaultLimit is used when the caller passes 0 as limit.
func ResolvePagination(page, limit, defaultLimit int) (resolvedPage, resolvedLimit, offset int) {
	if page <= 0 {
		page = 1
	}
	if limit <= 0 {
		limit = defaultLimit
	}
	if limit > 100 {
		limit = 100 // hard cap
	}
	offset = (page - 1) * limit
	return page, limit, offset
}

// BuildMeta creates a PaginationMeta from the resolved values and total count.
func BuildMeta(page, limit int, total int64) PaginationMeta {
	totalPages := int(total) / limit
	if int(total)%limit != 0 {
		totalPages++
	}
	if totalPages < 1 {
		totalPages = 1
	}
	return PaginationMeta{
		CurrentPage:  page,
		PerPage:      limit,
		TotalRecords: total,
		TotalPages:   totalPages,
		HasNext:      page < totalPages,
		HasPrev:      page > 1,
	}
}
