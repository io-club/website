package api

import (
	"encoding/gob"
	"net/http"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
)

const (
	AUTH_TYPE = "AUTHTYPE"
	AUTH_INFO = "AUTHINFO"
)

type User struct {
	UserName string `form:"username" json:"username" binding:"required,min=3,max=32,alphanum"`
	Password string `form:"password" json:"password" binding:"required,min=8,max=32"`
	Email    string `json:"email" binding:"omitempty,max=32,email"`
	Phone    string `json:"phone" binding:"omitempty,max=32,numeric"`
	Role     string `json:"role" binding:"omitempty,max=32"`
}

func SetupAuth(router *gin.Engine) (func(c *gin.Context), error) {
	gob.Register(User{})

	auth := func(c *gin.Context) {
		session := sessions.Default(c)

		if v, ok := session.Get(AUTH_TYPE).(string); !ok || len(v) == 0 {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"message": "need to login",
			})
		}
	}

	pubApi := router.Group("/auth")
	pubApi.POST("/login", func(c *gin.Context) {
		session := sessions.Default(c)

		if v, ok := session.Get(AUTH_TYPE).(string); ok && len(v) > 0 {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "already logged in",
			})
			return
		}

		var loginArgs User

		if err := c.ShouldBind(&loginArgs); err != nil {
			c.Error(err)
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "invalid arguments",
			})
			return
		}

		users := []User{}
		if err := harperdb.Request(gin.H{
			"operation":      "search_by_hash",
			"schema":         "ioclub",
			"table":          "users",
			"hash_values":    []string{loginArgs.UserName},
			"get_attributes": []string{"*"},
		}, &users); err != nil {
			c.Error(err)
			c.JSON(http.StatusInternalServerError, gin.H{
				"message": "failed to operate database",
			})
			return
		}
		if len(users) != 1 || users[0].Password != loginArgs.Password {
			c.JSON(http.StatusUnauthorized, gin.H{
				"message": "failed to authenticate",
			})
			return
		}

		session.Set(AUTH_TYPE, "native")
		session.Set(AUTH_INFO, users[0])
		session.Options(sessions.Options{
			HttpOnly: true,
			Secure:   SITE_PRODUCTION,
			Domain:   SITE_DOMAIN,
			SameSite: http.SameSiteStrictMode,
		})

		if err := session.Save(); err != nil {
			c.Error(err)
			c.JSON(http.StatusInternalServerError, gin.H{
				"message": "failed to save session",
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "success",
		})
	})

	privApi := router.Group("/auth", auth)
	privApi.GET("/logout", func(c *gin.Context) {
		session := sessions.Default(c)

		session.Delete(AUTH_TYPE)

		if err := session.Save(); err != nil {
			c.Error(err)
			c.JSON(http.StatusInternalServerError, gin.H{
				"message": "failed to save session",
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "success",
		})
	})
	privApi.GET("/info", func(c *gin.Context) {
		session := sessions.Default(c)

		c.JSON(http.StatusOK, gin.H{
			"type": session.Get(AUTH_TYPE),
			"info": session.Get(AUTH_INFO),
		})
	})

	return auth, nil
}
