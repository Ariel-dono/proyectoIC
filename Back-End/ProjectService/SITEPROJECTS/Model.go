package main

import (
	"net/http"
)

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

type Namespace struct {
	Username	 string	 `json:"username"`
	ProjectNames	[]Project `json:"projects"`
}

type Project struct{
	Id 		 string	 `json:"id"`
	Name		 string  `json:"name"`
}

type NamespaceRequest struct {
	Username	 string	 `json:"username"`
}
