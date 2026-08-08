package middlewares

import (
	"net/http"
	"slices"

	"github.com/gin-gonic/gin"
)

func RequiredRole(allowedRoles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {

		role := c.GetString("role")
		if role == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"Messege":    "You dont hav required  roles to do this action",
				"is_success": false,
			})
			return
		}

		if slices.Contains(allowedRoles, role) {
			c.Next()
			return
		}

		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
			"Messege":    "You dont hav required  roles to do this action",
			"is_success": false,
		})

	}
}
