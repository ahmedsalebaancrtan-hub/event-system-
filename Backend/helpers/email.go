package helpers

import (
	"fmt"
	"net/smtp"
	"os"
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