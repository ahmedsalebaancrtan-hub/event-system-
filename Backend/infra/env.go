package infra

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type AppConfig struct {
	Port            string
	DbUser          string
	DbPassword      string
	DbName          string
	DbPort          string
	DbHost          string
	AccessJwtToken  string
	RefreshJwtToken string
	EmailUser       string
	EmailPass       string
}

var Configuration AppConfig

func InitEnv() {
	err := godotenv.Load()
	if err != nil {
		log.Println("Warning: .env file not found, using system environment variables")
	}

	Configuration.Port = getEnv("PORT", "5000")

	Configuration.DbHost = os.Getenv("DB_HOST")
	Configuration.DbPort = getEnv("DB_PORT", "5432")
	Configuration.DbUser = os.Getenv("DB_USER")
	Configuration.DbPassword = os.Getenv("DB_PASSWORD")
	Configuration.DbName = os.Getenv("DB_NAME")

	Configuration.AccessJwtToken = os.Getenv("Access_jwt_Token")
	Configuration.RefreshJwtToken = os.Getenv("Refresh_jwt_Token")

	Configuration.EmailUser = os.Getenv("EMAIL_USER")
	Configuration.EmailPass = os.Getenv("EMAIL_PASS")

	requiredVars := map[string]string{
		"DB_HOST":           Configuration.DbHost,
		"DB_USER":           Configuration.DbUser,
		"DB_PASSWORD":       Configuration.DbPassword,
		"DB_NAME":           Configuration.DbName,
		"Access_jwt_Token":  Configuration.AccessJwtToken,
		"Refresh_jwt_Token": Configuration.RefreshJwtToken,
		"EMAIL_USER":        Configuration.EmailUser,
		"EMAIL_PASS":        Configuration.EmailPass,
	}

	for key, value := range requiredVars {
		if value == "" {
			log.Fatalf(
				"CRITICAL ERROR: Environment variable %s is not set",
				key,
			)
		}
	}
}

func getEnv(key, fallback string) string {
	value := os.Getenv(key)

	if value == "" {
		return fallback
	}

	return value
}
