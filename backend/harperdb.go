package api

import (
	"fmt"
	"net/http"

	"github.com/go-resty/resty/v2"
)

type Harper struct {
	url    string
	schema string
	token  string
	client *resty.Client
}

func NewHarper(url, schema, token string) *Harper {
	return &Harper{
		url:    url,
		schema: schema,
		token:  token,
		client: resty.New(),
	}
}

func (h *Harper) Request(request map[string]interface{}, result interface{}) error {
	req := h.client.R().
		SetHeader("Content-Type", "application/json").
		SetBody(request).
		SetAuthScheme(h.schema).
		SetAuthToken(h.token)

	if result != nil {
		req = req.SetResult(result)
	}

	res, err := req.Post(h.url)
	if err != nil {
		return err
	}
	if res.StatusCode() != http.StatusOK {
		return fmt.Errorf("failed to operate database: %s", res.String())
	}
	return nil
}
