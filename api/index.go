package api

import (
	"net/http"

	. "github.com/xhebox/ioclub/backend"
)

func Handler(w http.ResponseWriter, r *http.Request) {
	Router.ServeHTTP(w, r)
}
