package main

import (
	"encoding/json"
	"net/http"
)

func Save(w http.ResponseWriter, r *http.Request) {
	decoder := json.NewDecoder(r.Body)
	var materialsSpace MaterialSupplies
	err := decoder.Decode(&materialsSpace)
	if err != nil {
		panic(err)
	}
	defer r.Body.Close()

	var response *Response = new(Response)
	put(materialsSpace, response)

	responseMessage(w,response)
}

func Delete(w http.ResponseWriter, r *http.Request) {

	decoder := json.NewDecoder(r.Body)

	var materialsSpace Request
	err := decoder.Decode(&materialsSpace)
	if err != nil {
		panic(err)
	}
	defer r.Body.Close()

	var response *Response = new(Response)
	remove(materialsSpace.Key, response)

	responseMessage(w,response)
}

func Get(w http.ResponseWriter, r *http.Request) {

	decoder := json.NewDecoder(r.Body)

	var materialsSpaceId Request
	err := decoder.Decode(&materialsSpaceId)
	if err != nil {
		panic(err)
	}
	defer r.Body.Close()

	var response *Response = new(Response)
	var materialSupplies *MaterialSupplies = new(MaterialSupplies)
	getById(materialsSpaceId.Key, materialSupplies, response)

	responseProject(w, materialSupplies, response)
}

func responseProject (w http.ResponseWriter, materialSupplies *MaterialSupplies,  response *Response) {
	if(response.Code > 0){
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Content-Type", "application/json; charset=UTF-8")

		err := json.NewEncoder(w).Encode(&materialSupplies)
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
