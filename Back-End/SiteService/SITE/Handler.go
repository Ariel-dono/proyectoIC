package main

import (
	"encoding/json"
	"net/http"
)

func SaveState(w http.ResponseWriter, r *http.Request) {
	decoder := json.NewDecoder(r.Body)
	var instance RequestingProject
	err := decoder.Decode(&instance)
	if err != nil {
		panic(err)
	}
	defer r.Body.Close()

	var response *Response = new(Response)
	put(instance, response)

	responseMessage(w,response)
}

func DeleteState(w http.ResponseWriter, r *http.Request) {

	decoder := json.NewDecoder(r.Body)

	var requestedProject Request
	err := decoder.Decode(&requestedProject)
	if err != nil {
		panic(err)
	}
	defer r.Body.Close()

	var response *Response = new(Response)
	remove(requestedProject.Key, response)

	responseMessage(w,response)
}

func GetState(w http.ResponseWriter, r *http.Request) {

	decoder := json.NewDecoder(r.Body)

	var requestedProject Request
	err := decoder.Decode(&requestedProject)
	if err != nil {
		panic(err)
	}
	defer r.Body.Close()

	var response *Response = new(Response)
	var project *Project = new(Project)
	getById(requestedProject.Key, project, response)

	responseProject(w, project, response)
}

func responseProject (w http.ResponseWriter, project *Project,  response *Response) {
	if(response.Code > 0){
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Content-Type", "application/json; charset=UTF-8")

		err := json.NewEncoder(w).Encode(&project)
		if err != nil {
			panic(err)
		}
	}else{
		responseMessage(w,response)
	}
}

func responseMessage (w http.ResponseWriter,  response *Response) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Content-Type", "application/json; charset=UTF-8")

	err := json.NewEncoder(w).Encode(&response)
	if err != nil {
		panic(err)
	}
}
