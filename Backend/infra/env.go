package infra

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type AppCofig struct {
	Port              string
	DbUser            string
	DbPassword        string
	DbName            string
	DbPort            string
	DbHost            string
	Access_jwt_Token  string
	Refresh_jwt_token string
	EMAIL_PASS        string
	EMAIL_USER        string
}

var Configuration AppCofig

func InitEnv() {
	err := godotenv.Load()

	if err != nil {
		log.Println("warning: .env file not found, using environment variables")
	}

	Configuration.Port = getEnv("PORT", "5000")
	Configuration.DbUser = os.Getenv("DB_USER")
	Configuration.DbPassword = os.Getenv("DB_PASSWORD")
	Configuration.DbName = os.Getenv("DB_NAME")
	Configuration.DbPort = os.Getenv("DB_PORT")
	Configuration.DbHost = os.Getenv("DB_HOST")
	Configuration.Access_jwt_Token = os.Getenv("Access_jwt_Token")
	Configuration.Refresh_jwt_token = os.Getenv("Refresh_jwt_Token")
	Configuration.EMAIL_USER = os.Getenv("EMAIL_USER")
	Configuration.EMAIL_PASS = os.Getenv("EMAIL_PASS")
}

func getEnv(key string, fallback string) string {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}

	return value
}
