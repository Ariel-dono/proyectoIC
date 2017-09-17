package main

import (
	"encoding/json"
	"net/http"
)

func UpdateProject(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Content-Type", "application/json; charset=UTF-8")
	decoder := json.NewDecoder(r.Body)

	var namespace Namespace

	err := decoder.Decode(&namespace)
	if err != nil {
		panic(err)
	}
	defer r.Body.Close()

	var response *Response = new(Response);
	if (namespace.Username == "" ){
		response.Code = -3;
		response.State.Message = "Parametros invalidos";
		err = json.NewEncoder(w).Encode(response);
	}else {
		UpdateProjectName(namespace.Username,response,namespace)
		w.WriteHeader(http.StatusOK)
		err = json.NewEncoder(w).Encode(response)
		if err != nil {
			panic(err)
			err = json.NewEncoder(w).Encode(&err)
		}
	}
}

func GetNamespace(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Content-Type", "application/json; charset=UTF-8")
	decoder := json.NewDecoder(r.Body)
	var request NamespaceRequest
	err := decoder.Decode(&request)
	if err != nil {
		panic(err)
	}
	defer r.Body.Close()

	var response *Response = new(Response);
	if (request.Username == "" ){
		response.Code = -2;
		response.State.Message = "Parametros invalidos";
		err = json.NewEncoder(w).Encode(response);
	}else {
		var namespace *Namespace = new (Namespace)
		getNamespace(request.Username, namespace, response)
		if (namespace.Username != "") {
			w.WriteHeader(http.StatusOK)
			err = json.NewEncoder(w).Encode(namespace)
			if err != nil {
				panic(err)
				err = json.NewEncoder(w).Encode(&response)
			}
		}else{
			err = json.NewEncoder(w).Encode(response);
		}
	}
}

func CreateNamespace(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Content-Type", "application/json; charset=UTF-8")
	decoder := json.NewDecoder(r.Body)
	var namespace Namespace
	err := decoder.Decode(&namespace)
	if err != nil {
		panic(err)
	}
	defer r.Body.Close()

	var response *Response = new(Response);
	if (namespace.Username == "" ){
		response.Code = -2;
		response.State.Message = "Parametros invalidos";
		err = json.NewEncoder(w).Encode(response);
	}else {
		CreateBucket(namespace.Username, response)
		w.WriteHeader(http.StatusOK)
		err = json.NewEncoder(w).Encode(response)
		if err != nil {
			panic(err)
			err = json.NewEncoder(w).Encode(&err)
		}
	}
}

func DeleteNamespace(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Content-Type", "application/json; charset=UTF-8")
	decoder := json.NewDecoder(r.Body)
	var namespace Namespace
	err := decoder.Decode(&namespace)
	if err != nil {
		panic(err)
	}
	defer r.Body.Close()

	var response *Response = new(Response);
	if (namespace.Username == "" ){
		response.Code = -2;
		response.State.Message = "Parametros invalidos";
		err = json.NewEncoder(w).Encode(response);
	}else {
		DeleteBucket(namespace.Username, response)
		w.WriteHeader(http.StatusOK)
		err = json.NewEncoder(w).Encode(response)
		if err != nil {
			panic(err)
			err = json.NewEncoder(w).Encode(&err)
		}
	}
}