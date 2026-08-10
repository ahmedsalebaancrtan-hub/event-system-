package helpers

import (
	"fmt"
	"net/smtp"
	"os"
	"strings"
)

func SendOTPEmail(toEmail string, otp string) error {

	from := os.Getenv("EMAIL_USER")
	password := os.Getenv("EMAIL_PASS")
	smtpHost := "smtp.gmail.com"
	smtpPort := "587"

	subject := "Subject: Your Password Reset OTP\n"
	body := fmt.Sprintf("Your one-time password for resetting your account is: %s\nThis code expires in 10 minutes.", otp)
	message := []byte(subject + "\n" + body)

	// 3. Authentication
	auth := smtp.PlainAuth("", from, password, smtpHost)

	// 4. Send the email
	err := smtp.SendMail(smtpHost+":"+smtpPort, auth, from, []string{toEmail}, message)
	if err != nil {
		return err
	}
	return nil
}

func SendEmail(toEmail, subject, body string) error {
	from := strings.TrimSpace(firstEnv("SMTP_EMAIL", "EMAIL_USER"))
	password := normalizeSMTPPassword(firstEnv("SMTP_PASS", "EMAIL_PASS"))
	smtpHost := strings.TrimSpace(firstEnv("SMTP_HOST"))
	smtpPort := strings.TrimSpace(firstEnv("SMTP_PORT"))
	toEmail = strings.TrimSpace(toEmail)

	if smtpHost == "" {
		smtpHost = "smtp.gmail.com"
	}
	if smtpPort == "" {
		smtpPort = "587"
	}

	if toEmail == "" {
		return fmt.Errorf("recipient email is required")
	}
	if from == "" || password == "" {
		return fmt.Errorf("SMTP credentials not configured: set SMTP_EMAIL/SMTP_PASS or EMAIL_USER/EMAIL_PASS")
	}

	headers := fmt.Sprintf(
		"From: %s\r\nTo: %s\r\nSubject: %s\r\nMIME-Version: 1.0\r\nContent-Type: text/html; charset=UTF-8\r\n\r\n",
		from, toEmail, subject,
	)
	message := []byte(headers + body)

	auth := smtp.PlainAuth("", from, password, smtpHost)
	return smtp.SendMail(smtpHost+":"+smtpPort, auth, from, []string{toEmail}, message)
}

func firstEnv(keys ...string) string {
	for _, key := range keys {
		if value := os.Getenv(key); value != "" {
			return value
		}
	}

	return ""
}

func normalizeSMTPPassword(password string) string {
	return strings.ReplaceAll(strings.TrimSpace(password), " ", "")
}
