package main

import (
	"net/http"
)

// Models for routing
type Route struct {
	Name        string
	Method      string
	Pattern     string
	HandlerFunc http.HandlerFunc
}

type Routes []Route

// JSON Http Response Model
type Response struct {
	State      	State    `json:"state"`
	Code 		int      `json:"code"`
}

type State struct {
	Message 	string 	 `json:"message"`
}

//User Model
type User struct {
	Username string `json:"username"`
	Email string `json:"email"`
	Password string `json:"pass"`
}

type UserRequest struct{
	Username string `json:"username"`
}

type LoginRequest struct{
	AuthName string `json:"name"`
	AuthPass string `json:"pass"`
}