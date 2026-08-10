package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/mubarik/EVENT_MANBAGEMENT_SYSTEM/handlers"
	"github.com/mubarik/EVENT_MANBAGEMENT_SYSTEM/middlewares"
)

func RegisterRoute(r *gin.Engine) {
	ApiGroup := r.Group("/api")

	UserHandler := handlers.RegisterUserHandler()
	EventHandler := handlers.RegisterEventHandler()
	RegisterHandler := handlers.NewRegisterHandler()
	UserGroup := ApiGroup.Group("/users")

	{
		UserGroup.POST("/create", UserHandler.CreateUser)
		UserGroup.POST("/login", UserHandler.LoginUser)
		UserGroup.POST("/verify-2fa-login", UserHandler.Verify2FALogin)
		UserGroup.GET("/user/:userId", middlewares.Authenticated(), middlewares.RequiredRole("ORGANIZER", "ADMIN"), UserHandler.GetUserById)
		UserGroup.GET("/allusers", middlewares.Authenticated(), middlewares.RequiredRole("ADMIN", "STAFF", "ORGANIZER"), UserHandler.GetAllUsers)
		UserGroup.GET("/whoami", middlewares.Authenticated(), middlewares.RequiredRole("ADMIN", "ORGANIZER", "STAFF"), UserHandler.WhoAmI)
		UserGroup.POST("/Refresh-token", middlewares.RefreshAuthenticated(), UserHandler.RefreshToken)
		UserGroup.POST("/forget-password", UserHandler.ForgotPassword)
		UserGroup.POST("/reset", UserHandler.ResetPassword)
		UserGroup.POST("/reset-password", middlewares.Authenticated(), middlewares.RequiredRole("ADMIN"), UserHandler.ResetPasswordByAdmin)

	}

	EventGroup := ApiGroup.Group("/events")
	{
		EventGroup.POST("/create", middlewares.Authenticated(), middlewares.RequiredRole("ADMIN", "ORGANIZER"), EventHandler.CreateEvent)
		EventGroup.GET("/list", middlewares.Authenticated(), middlewares.RequiredRole("ADMIN", "ORGANIZER", "STAFF"), EventHandler.Getall)
		EventGroup.GET("/details/:event_id", middlewares.Authenticated(), middlewares.RequiredRole("ADMIN", "ORGANIZER", "STAFF"), EventHandler.FindEventByid)
		EventGroup.PATCH("/Update/:id", middlewares.Authenticated(), middlewares.RequiredRole("ADMIN", "STAFF", "ORGANIZER"), EventHandler.UpdateEvent)
		EventGroup.GET("/search", middlewares.Authenticated(), middlewares.RequiredRole("ADMIN", "STAFF", "ORGANIZER"), EventHandler.FilterEvents)
		EventGroup.PATCH("/approve/:id", middlewares.Authenticated(), middlewares.RequiredRole("ADMIN"), EventHandler.ApproveEvent)
		EventGroup.GET("/approved-event", middlewares.Authenticated(), middlewares.RequiredRole("ADMIN"), EventHandler.GetApprovedEvents)
	}

	publicGroup := ApiGroup.Group("/public")
	{
		publicGroup.POST("/register", RegisterHandler.PublicRegister)
		publicGroup.GET("/events/search", EventHandler.FilterEvents)
		publicGroup.GET("/events/:event_id", EventHandler.FindEventByid)
		publicGroup.GET("/events", EventHandler.GetApprovedEvents)
	}

	RegistrationGroup := ApiGroup.Group("/registrations")
	RegistrationGroup.Use(middlewares.Authenticated(), middlewares.RequiredRole("ADMIN", "STAFF"))
	{
		RegistrationGroup.GET("/pending", RegisterHandler.GetPendingRegistrations)
		RegistrationGroup.GET("/approved", RegisterHandler.GetApprovedRegistrations)
		RegistrationGroup.PATCH("/:id/review", RegisterHandler.ReviewRegistration)
	}

	legacyRegisterGroup := ApiGroup.Group("/registers")
	legacyRegisterGroup.Use(middlewares.Authenticated(), middlewares.RequiredRole("ADMIN", "STAFF", "ORGANIZER"))
	{
		legacyRegisterGroup.GET("/events/:event_id/users", RegisterHandler.GetApprovedEventAttendees)
		legacyRegisterGroup.GET("/users/:id/events", RegisterHandler.GetApprovedEventsForCurrentGuest)
	}

}
