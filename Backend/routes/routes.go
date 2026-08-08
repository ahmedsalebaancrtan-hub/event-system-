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

	RegisterGroup := ApiGroup.Group("/registers")
	{
		RegisterGroup.POST("/create", middlewares.Authenticated(), RegisterHandler.RegisterToEvent)
		RegisterGroup.GET("/events/:id/users", middlewares.Authenticated(), RegisterHandler.GetEventUsers)
		RegisterGroup.GET("/users/:id/events", middlewares.Authenticated(), RegisterHandler.GetUserEvents)
		RegisterGroup.DELETE("/:eventId", middlewares.Authenticated(), RegisterHandler.CancelRegistration)
	}

}
