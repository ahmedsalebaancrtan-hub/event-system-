package routes

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/mubarik/EVENT_MANBAGEMENT_SYSTEM/middlewares"
)

func TestPublicEventsRouteIsRegistered(t *testing.T) {
	gin.SetMode(gin.TestMode)
	r := gin.New()

	RegisterRoute(r)

	for _, route := range r.Routes() {
		if route.Method == http.MethodGet && route.Path == "/api/public/events" {
			return
		}
	}

	t.Fatal("GET /api/public/events route is not registered")
}

func TestCORSHandlesPublicPreflight(t *testing.T) {
	gin.SetMode(gin.TestMode)
	r := gin.New()
	r.Use(middlewares.CORSMiddleware())

	RegisterRoute(r)

	req := httptest.NewRequest(http.MethodOptions, "/api/public/events", nil)
	req.Header.Set("Origin", "http://localhost:5173")

	res := httptest.NewRecorder()
	r.ServeHTTP(res, req)

	if res.Code != http.StatusNoContent {
		t.Fatalf("expected OPTIONS /api/public/events to return 204, got %d", res.Code)
	}
}
