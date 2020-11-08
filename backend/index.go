package api

import (
	"log"
	"os"

	"github.com/gin-contrib/sessions"
	"github.com/gin-contrib/sessions/cookie"
	"github.com/gin-gonic/gin"
)

var (
	HARPERDB_URL         = os.Getenv("HARPERDB_URL")
	HARPERDB_AUTH_SCHEMA = os.Getenv("HARPERDB_AUTH_SCHEMA")
	HARPERDB_AUTH_TOKEN  = os.Getenv("HARPERDB_AUTH_TOKEN")
	harperdb = NewHarper(HARPERDB_URL, HARPERDB_AUTH_SCHEMA, HARPERDB_AUTH_TOKEN)
)

var (
	SITE_DOMAIN = os.Getenv("SITE_DOMAIN")
	SITE_PRODUCTION = os.Getenv("SITE_PRODUCTION") != ""
)

var Router *gin.Engine

func init() {
	Router = gin.New()
	Router.Use(gin.Logger())
	Router.Use(gin.Recovery())

	store := cookie.NewStore([]byte(os.Getenv("SESS_SECRET")))
	Router.Use(sessions.Sessions("sess", store))

	auth, err := SetupAuth(Router)
	if err != nil {
		log.Fatalf("jwt error: %v", err)
	}

	if err := SetupPastebin(Router, auth); err != nil {
		log.Fatalf("pastebin error: %v", err)
	}
}
