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

//Request by key
type Request  struct {
	Key 		string	 		`json:"key"`
}

//Response messaging
type Response struct {
	State      	State    		`json:"state"`
	Code 		int      		`json:"code"`
}

type State struct {
	Message 	string 	 		`json:"message"`
}

//Request by key
type MaterialSupplies struct {
	ProjectId 	string			`json:"project_id"`
	MyMaterials 	[]MaterialSupply	`json:"materials"`
}

//Project model
type MaterialSupply struct {
	Id 		string			`json:"id"`
	Priority	int 			`json:"priority"`
	Name		string			`json:"name"`
	MaterialType	string			`json:"material_type"`
	WorkerTraffic	int			`json:"worker_traffic"`
}