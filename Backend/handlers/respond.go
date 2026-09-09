package handlers

import "github.com/gin-gonic/gin"

// respond is the single source of truth for all HTTP response shapes.
// All handlers must use these helpers instead of calling c.JSON directly.

// ok sends a successful response with a message and optional data payload.
func ok(c *gin.Context, status int, message string, data any) {
	body := gin.H{
		"success": true,
		"message": message,
	}
	if data != nil {
		body["data"] = data
	}
	c.JSON(status, body)
}

// okPaginated sends a successful response with data and pagination metadata.
func okPaginated(c *gin.Context, status int, message string, data any, meta any) {
	c.JSON(status, gin.H{
		"success":    true,
		"message":    message,
		"data":       data,
		"pagination": meta,
	})
}

// fail sends an error response.
func fail(c *gin.Context, status int, message string) {
	c.JSON(status, gin.H{
		"success": false,
		"message": message,
	})
}
