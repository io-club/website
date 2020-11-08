package main

import (
	"log"

	. "github.com/xhebox/ioclub/backend"
)

func main() {
	if err := Router.Run(":3001"); err != nil {
		log.Fatal(err)
	}
}
