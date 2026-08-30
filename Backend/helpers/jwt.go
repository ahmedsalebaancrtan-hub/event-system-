package helpers

import (
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/mubarik/EVENT_MANBAGEMENT_SYSTEM/infra"
	"github.com/mubarik/EVENT_MANBAGEMENT_SYSTEM/models"
)
func GenerateJwt(role models.Role, userID uint, sub string, ExpireIn int64, isrefreshToken bool) (string, error) {
	config := infra.Configuration

	var jwtsecret []byte

	if isrefreshToken {
		jwtsecret = []byte(config.RefreshJwtToken)
	} else {
		jwtsecret = []byte(config.AccessJwtToken)
	}
	claims := jwt.MapClaims{
		"userID":         userID,
		"sub":            sub,
		"npf":            time.Now(),
		"exp":            ExpireIn,
		"isrefreshToken": isrefreshToken,
		"role":           role,
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtsecret)
}