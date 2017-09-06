package main

import (
	"log"
	"net/http"
)

func main() {
	router := NewRouter();
	log.Fatal(http.ListenAndServe(":10128", router));
}
