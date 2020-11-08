package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type Paste struct {
	ID      string `json:"id"`
	UserID  string `json:"userid"`
	Content string `json:"content" binding:"required,max=1048576"`
}

func SetupPastebin(router *gin.Engine, auth func(c *gin.Context)) error {
	privApi := router.Group("/paste", auth)
	privApi.POST("/upload", func(c *gin.Context) {
		var paste Paste

		if err := c.ShouldBind(&paste); err != nil {
			c.Error(err)
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "invalid content",
			})
			return
		}

		if err := harperdb.Request(gin.H{
			"operation":      "insert",
			"schema":         "ioclub",
			"table":          "users",
			"records":    []Paste{paste},
		}, &paste); err != nil {
			c.Error(err)
			c.JSON(http.StatusInternalServerError, gin.H{
				"message": "failed to operate database",
			})
			return
		}

		c.JSON(http.StatusOK, paste)
	})

	pubApi := router.Group("/paste")
	pubApi.GET("/:id", func(c *gin.Context) {
		id := c.Param("id")

		pastes := []Paste{}
		if err := harperdb.Request(gin.H{
			"operation":      "search_by_hash",
			"schema":         "ioclub",
			"table":          "users",
			"hash_values":    []string{id},
			"get_attributes": []string{"*"},
		}, &pastes); err != nil {
			c.Error(err)
			c.JSON(http.StatusInternalServerError, gin.H{
				"message": "failed to operate database",
			})
			return
		}
		if len(pastes) != 1 {
			c.JSON(http.StatusInternalServerError, gin.H{
				"message": "no such paste or has been deleted",
			})
			return
		}

		c.JSON(http.StatusOK, pastes[0])
	})
	return nil
}
