package main

import (
	"log"
	"net/http"
)

func main() {
	router := NewRouter();
	log.Fatal(http.ListenAndServe("localhost:10125", router));
}
