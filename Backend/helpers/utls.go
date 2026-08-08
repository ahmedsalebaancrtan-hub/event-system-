package helpers

import (
	"crypto/rand"
	"io"
)

// GenerateNumericOTP creates a secure random numeric string of length n
func GenerateNumericOTP(n int) string {
	const table = "1234567890"
	b := make([]byte, n)
	io.ReadAtLeast(rand.Reader, b, n)
	for i := 0; i < len(b); i++ {
		b[i] = table[int(b[i])%len(table)]
	}
	return string(b)
}
