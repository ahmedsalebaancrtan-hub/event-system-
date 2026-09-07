package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/mubarik/EVENT_MANBAGEMENT_SYSTEM/dtos"
	"github.com/mubarik/EVENT_MANBAGEMENT_SYSTEM/infra"
	"github.com/mubarik/EVENT_MANBAGEMENT_SYSTEM/repository"
	"github.com/mubarik/EVENT_MANBAGEMENT_SYSTEM/services"
)

type UserHandler struct {
	Usersvc *services.UserService
}

func RegisterUserHandler() *UserHandler {
	userRepo := repository.RegisterRepo(infra.DB)
	usersvc := services.NewUserService(userRepo)
	return &UserHandler{Usersvc: usersvc}
}

func (h *UserHandler) CreateUser(c *gin.Context) {
	var body dtos.CreateUserdto
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid body", "error": err.Error()})
		return
	}
	status, err := h.Usersvc.CreateUser(&body)
	if err != nil {
		c.JSON(status, gin.H{"success": false, "message": err.Error()})
		return
	}
	c.JSON(status, gin.H{"success": true, "message": "User Created successfully"})
}

func (h *UserHandler) LoginUser(c *gin.Context) {
	var req dtos.CreateLogindto
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid request body", "error": err.Error()})
		return
	}
	response, statusCode, err := h.Usersvc.LoginUser(&req)
	if err != nil {
		c.JSON(statusCode, gin.H{"success": false, "message": err.Error()})
		return
	}
	c.JSON(statusCode, gin.H{"success": true, "message": "Login successful", "data": response})
}

// FORGOT PASSWORD
func (h *UserHandler) ForgotPassword(c *gin.Context) {
	var body dtos.ForgotPasswordDTO
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}
	status, _ := h.Usersvc.ForgotPassword(&body)
	c.JSON(status, gin.H{"success": true, "message": "If email exists, an OTP has been sent."})
}

// RESET PASSWORD
func (h *UserHandler) ResetPassword(c *gin.Context) {
	var body dtos.ResetPasswordDTO
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	// 🔥 IMPORTANT: Call the Email OTP version, not the 2FA version
	status, err := h.Usersvc.ResetPassword(&body)
	if err != nil {
		c.JSON(status, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(status, gin.H{"success": true, "message": "Password updated successfully using Email OTP"})
}

func (h *UserHandler) GetAllUsers(c *gin.Context) {
	var filter dtos.UserFilterDTO
	if err := c.ShouldBindQuery(&filter); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	status, data, total, err := h.Usersvc.GetAllUsers(filter)
	if err != nil {
		c.JSON(status, gin.H{"success": false, "message": err.Error()})
		return
	}

	page, limit, _ := dtos.ResolvePagination(filter.Page, filter.Limit, 10)
	meta := dtos.BuildMeta(page, limit, total)

	c.JSON(status, gin.H{
		"success":    true,
		"message":    "Users fetched successfully",
		"data":       data,
		"pagination": meta,
	})
}

func (h *UserHandler) GetUserById(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("userId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "invalid id"})
		return
	}
	status, user, err := h.Usersvc.GetUserById(uint(id))
	if err != nil {
		c.JSON(status, gin.H{"success": false, "message": err.Error()})
		return
	}
	c.JSON(status, gin.H{"success": true, "message": "User fetched successfully", "data": user})
}

func (h *UserHandler) WhoAmI(c *gin.Context) {
	email := c.GetString("email")
	user, status, err := h.Usersvc.WhoAmI(email)
	if err != nil {
		c.JSON(status, gin.H{"success": false, "message": err.Error()})
		return
	}
	c.JSON(status, gin.H{"success": true, "user": user})
}

func (h *UserHandler) ResetPasswordByAdmin(c *gin.Context) {
	var body dtos.ResetPasswordDTO
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}
	adminEmail := c.GetString("email")
	status, err := h.Usersvc.ResetPasswordByAdmin(adminEmail, &body)
	if err != nil {
		c.JSON(status, gin.H{"success": false, "message": err.Error()})
		return
	}
	c.JSON(status, gin.H{"success": true, "message": "password reset by admin successfully"})
}

// 2FA HANDLERS
func (h *UserHandler) Generate2FA(c *gin.Context) {
	email := c.GetString("email")
	secret, url, err := h.Usersvc.Generate2FA(email)
	if err != nil {
		c.JSON(500, gin.H{"success": false, "message": err.Error()})
		return
	}
	// Note: In a real app, store 'secret' in a short-lived cache/session
	c.JSON(200, gin.H{"success": true, "message": "2FA generated successfully", "qr_url": url, "temp_secret": secret})
}

func (h *UserHandler) Enable2FA(c *gin.Context) {
	email := c.GetString("email")
	var body struct {
		Code   string `json:"code"`
		Secret string `json:"secret"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(400, gin.H{"success": false, "message": err.Error()})
		return
	}
	if err := h.Usersvc.Enable2FA(email, body.Code, body.Secret); err != nil {
		c.JSON(400, gin.H{"success": false, "message": err.Error()})
		return
	}
	c.JSON(200, gin.H{"success": true, "message": "2FA enabled successfully"})
}

func (h *UserHandler) Verify2FA(c *gin.Context) {
	email := c.GetString("email")
	var body struct {
		Code string `json:"code"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(400, gin.H{"success": false, "message": err.Error()})
		return
	}
	resp, status, err := h.Usersvc.Verify2FA(email, body.Code)
	if err != nil {
		c.JSON(status, gin.H{"success": false, "message": err.Error()})
		return
	}
	c.JSON(status, gin.H{"success": true, "message": "2FA verified successfully", "data": resp})
}

func (h *UserHandler) RefreshToken(c *gin.Context) {

	email, exists := c.Get("email")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "Unauthorized: No email found in context",
		})
		return
	}

	// 2. Call the service
	response, statusCode, err := h.Usersvc.RefreshToken(email.(string))
	if err != nil {
		c.JSON(statusCode, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	c.JSON(statusCode, gin.H{
		"success": true,
		"message": "Token refreshed successfully!",
		"data":    response,
	})
}

// handlers/user_handler.go

func (h *UserHandler) Verify2FALogin(c *gin.Context) {
	var body struct {
		Email string `json:"email"`
		OTP   string `json:"otp"`
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Email and OTP are required"})
		return
	}

	// Make sure the service method name also matches: Verify2FALogin
	response, statusCode, err := h.Usersvc.Verify2FALogin(body.Email, body.OTP)
	if err != nil {
		c.JSON(statusCode, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(statusCode, gin.H{
		"success": true,
		"message": "2FA Verification successful",
		"data":    response,
	})
}
