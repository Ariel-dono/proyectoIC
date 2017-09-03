package main

import "net/http"

type Route struct {
	Name        string
	Method      string
	Pattern     string
	HandlerFunc http.HandlerFunc
}

type Routes []Route

type Response struct {
	State      	State    `json:"state"`
	Code 		int      `json:"code"`
}

type State struct {
	Message 	string 	 `json:"message"`
}
