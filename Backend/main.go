package main

import (
	"fmt"
	"log/slog"

	"github.com/gin-gonic/gin"
	"github.com/mubarik/EVENT_MANBAGEMENT_SYSTEM/infra"
	"github.com/mubarik/EVENT_MANBAGEMENT_SYSTEM/middlewares"
	"github.com/mubarik/EVENT_MANBAGEMENT_SYSTEM/routes"
)

func main() {
	slog.Info("initialised enviroment varibale")
	infra.InitEnv()
	config := infra.Configuration
	slog.Info("Connect database successfully")
	infra.DbConnect()
	slog.Info("Connect database succesfully")

	r := gin.Default()
	r.Use(middlewares.CORSMiddleware())

	routes.RegisterRoute(r)

	slog.Info("application is running successfully on port 5000")
	r.Run(fmt.Sprintf(":%s", config.Port))

}
