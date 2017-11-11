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

//Request by key
type Request  struct {
	Key 		string	 `json:"key"`
}

type RequestingProject struct{
	Key		string	 `json:"key"`
	ProjectInstance Project	 `json:"project_instance"`	
}

//Project model
type Project struct {
	Layers		[]Layer		 `json:"layers"`
	//Information about project
	Name 		string 		 `json:"name"`
	Zoom 		int 		 `json:"zoom"`
	Reference 	Point		 `json:"reference"`
}

type Layer struct {
	Stages		[]VectorSequence `json:"stages"`
	Level 		int		 `json:"level"`
}

//Functional Areas
//Nature types: 1. Dynamic Area, 2. Temporal Area, 3. Locked Area, 4.Machinery path 5. workers path
type VectorSequence struct {
	Id 		string		`json:"id"`
	VectorsSequence []Point	 	`json:"vectors_sequence"`
	Variables	[]Variable	`json:"variables"`
}

//Nature: data type
type Variable struct {
	Name		string		`json:"name"`
	Content		string		`json:"content"`
	VarType		bool		`json:"var_type"`
}

type Point struct {
	X 		float64 	`json:"x"`
	Y		float64 	`json:"y"`
}