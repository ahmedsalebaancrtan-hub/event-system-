package middlewares

import (
	"log/slog"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/mubarik/EVENT_MANBAGEMENT_SYSTEM/infra"
)

// ===============================
// JWT CLAIMS
// ===============================

type Claims struct {
	Sub    string `json:"sub"`
	Role   string `json:"role"`
	UserID uint   `json:"userID"`

	jwt.RegisteredClaims
}

// ===============================
// ACCESS TOKEN MIDDLEWARE
// ===============================

func Authenticated() gin.HandlerFunc {
	return func(c *gin.Context) {

		// 1. Get Authorization Header
		authHeader := c.GetHeader("Authorization")

		// 2. Check if header exists
		if authHeader == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"message":    "Missing Authorization header",
				"is_success": false,
			})
			return
		}

		// 3. Validate Bearer format
		if !strings.HasPrefix(authHeader, "Bearer ") {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"message":    "Invalid Authorization header format",
				"is_success": false,
			})
			return
		}

		// 4. Extract token
		tokenStr := strings.TrimPrefix(authHeader, "Bearer ")

		claims := &Claims{}

		// 5. Parse and validate token
		token, err := jwt.ParseWithClaims(
			tokenStr,
			claims,
			func(t *jwt.Token) (interface{}, error) {

				// Validate signing method
				if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
					return nil, jwt.ErrSignatureInvalid
				}

				return []byte(infra.Configuration.Access_jwt_Token), nil
			},
		)

		// 6. Validate token
		if err != nil || !token.Valid {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"message":    "Unauthenticated",
				"is_success": false,
			})
			return
		}

		// 7. Check token expiration
		if claims.ExpiresAt == nil || claims.ExpiresAt.Time.Before(time.Now()) {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"message":    "Access token expired",
				"is_success": false,
			})
			return
		}

		// 8. Store user data in context
		c.Set("user_id", claims.UserID)
		c.Set("email", claims.Sub)
		c.Set("role", claims.Role)

		// 9. Log authenticated user
		slog.Info(
			"Authenticated user",
			"email", claims.Sub,
			"role", claims.Role,
			"user_id", claims.UserID,
		)

		// 10. Continue request
		c.Next()
	}
}

// ===============================
// REFRESH TOKEN MIDDLEWARE
// ===============================

func RefreshAuthenticated() gin.HandlerFunc {
	return func(c *gin.Context) {

		// 1. Get Authorization Header
		authHeader := c.GetHeader("Authorization")

		// 2. Check header exists
		if authHeader == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"message":    "Missing Authorization header",
				"is_success": false,
			})
			return
		}

		// 3. Validate Bearer format
		if !strings.HasPrefix(authHeader, "Bearer ") {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"message":    "Invalid Authorization header format",
				"is_success": false,
			})
			return
		}

		// 4. Extract token
		tokenStr := strings.TrimPrefix(authHeader, "Bearer ")

		claims := &Claims{}

		// 5. Parse token
		token, err := jwt.ParseWithClaims(
			tokenStr,
			claims,
			func(t *jwt.Token) (interface{}, error) {

				// Validate signing method
				if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
					return nil, jwt.ErrSignatureInvalid
				}

				return []byte(infra.Configuration.Refresh_jwt_token), nil
			},
		)

		// 6. Validate token
		if err != nil || !token.Valid {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"message":    "Unauthorized access",
				"is_success": false,
			})
			return
		}

		// 7. Check refresh token expiration
		if claims.ExpiresAt == nil || claims.ExpiresAt.Time.Before(time.Now()) {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"message":    "Refresh token expired",
				"is_success": false,
			})
			return
		}

		// 8. Store refresh user data
		c.Set("user_email", claims.Sub)
		c.Set("user_id", claims.UserID)
		c.Set("role", claims.Role)

		// 9. Continue request
		c.Next()
	}
}
