package infra

import (
	"fmt"
	"log"

	"github.com/mubarik/EVENT_MANBAGEMENT_SYSTEM/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func DbConnect() {
	config := Configuration

	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s port=%s dbname=%s sslmode=disable",
		config.DbHost,
		config.DbUser,
		config.DbPassword,
		config.DbPort,
		config.DbName,
	)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// Auto-migrate all models
	err = db.AutoMigrate(
		&models.User{},
		&models.PasswordResetToken{},
		&models.Event{},
		&models.EventRegistration{},
	)
	if err != nil {
		log.Fatalf("AutoMigrate failed: %v", err)
	}

	DB = db

	log.Println("Database connected and migrations completed successfully!")
}
