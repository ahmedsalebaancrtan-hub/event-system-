package infra

import (
	"fmt"
	"log/slog"
	"regexp"
	"strings"
	"time"

	"github.com/mubarik/EVENT_MANBAGEMENT_SYSTEM/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

var postgresIdentifierPattern = regexp.MustCompile(`^[A-Za-z_][A-Za-z0-9_]*$`)

func DbConnect() {
	config := Configuration

	db, err := connectWithRetry(config.DbHost, config, 15, 2*time.Second)
	if err != nil && shouldRetryLocalhost(config.DbHost) {
		slog.Warn("database connection failed, retrying with localhost", "host", config.DbHost, "error", err)
		db, err = connectWithRetry("localhost", config, 3, 2*time.Second)
	}

	if err != nil {
		panic(fmt.Sprintf("failed to connect database: %v", err))
	}
	db.AutoMigrate(models.User{}, models.PasswordResetToken{},
		models.Event{}, models.EventRegistration{})

	DB = db

}

func openDatabase(host string, config AppCofig) (*gorm.DB, error) {
	dsn := fmt.Sprintf("host=%s user=%s password=%s port=%s dbname=%s sslmode=disable", host, config.DbUser, config.DbPassword, config.DbPort, config.DbName)

	return gorm.Open(postgres.Open(dsn), &gorm.Config{})
}

func connectWithDatabaseCreate(host string, config AppCofig) (*gorm.DB, error) {
	db, err := openDatabase(host, config)
	if err == nil {
		return db, nil
	}

	if !strings.Contains(err.Error(), "SQLSTATE 3D000") {
		return nil, err
	}

	if createErr := createDatabase(host, config); createErr != nil {
		return nil, fmt.Errorf("%w; also failed to create database %q: %v", err, config.DbName, createErr)
	}

	return openDatabase(host, config)
}

func connectWithRetry(host string, config AppCofig, attempts int, delay time.Duration) (*gorm.DB, error) {
	var lastErr error

	for attempt := 1; attempt <= attempts; attempt++ {
		db, err := connectWithDatabaseCreate(host, config)
		if err == nil {
			return db, nil
		}

		lastErr = err
		slog.Warn("database connection attempt failed", "host", host, "attempt", attempt, "attempts", attempts, "error", err)

		if attempt < attempts {
			time.Sleep(delay)
		}
	}

	return nil, lastErr
}

func createDatabase(host string, config AppCofig) error {
	if !postgresIdentifierPattern.MatchString(config.DbName) {
		return fmt.Errorf("invalid database name %q", config.DbName)
	}

	adminConfig := config
	adminConfig.DbName = "postgres"

	db, err := openDatabase(host, adminConfig)
	if err != nil {
		return err
	}

	sqlDB, err := db.DB()
	if err == nil {
		defer sqlDB.Close()
	}

	return db.Exec(fmt.Sprintf(`CREATE DATABASE "%s"`, config.DbName)).Error
}

func shouldRetryLocalhost(host string) bool {
	return host != "" && host != "localhost" && host != "127.0.0.1"
}
