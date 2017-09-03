package main

import (
	"net/http"
)

//Routing model
type Route struct {
	Name        string
	Method      string
	Pattern     string
	HandlerFunc http.HandlerFunc
}

type Routes []Route

//Response messaging
type Response struct {
	State      	State    `json:"state"`
	Code 		int      `json:"code"`
}

type State struct {
	Message 	string 	 `json:"message"`
}

//Projects management
type namespace struct {
	Projects 	[]string	 `json:"projects"`
	Owner 		string		 `json:"owner"`
}

//Project model
type project struct {
	Stages		[]vectorSequence `json:"stages"`
	//Information about project
	Name 		string 		 `json:"name"`
	Zoom 		int 		 `json:"zoom"`
	Reference	Point		 `json:"reference"`
}

//Functional Areas
//Nature types: 1. Dynamic Area, 2. Temporal Area, 3. Locked Area, 4.Machinery path 5. workers path
type vectorSequence struct {
	VectorsSequence []Point	 `json:"vectors_sequence"`
	Nature		int 	 `json:"nature"`
}

type Point struct {
	X 		int 	`json:"x"`
	Y		int 	`json:"y"`
}