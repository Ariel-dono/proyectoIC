package main

import (
	"encoding/json"
	"net/http"
	"gopkg.in/couchbase/gocb.v1"
)

func InsertUser(w http.ResponseWriter, r *http.Request) {
	decoder := json.NewDecoder(r.Body)
	var user User
	err := decoder.Decode(&user)
	if err != nil {
		panic(err)
	}
	defer r.Body.Close()

	var response *Response = new(Response)
	put(user, response)
	err = json.NewEncoder(w).Encode(response)
	if err != nil {
		panic(err)
		err = json.NewEncoder(w).Encode(&err)
	}
}

func GetUser(w http.ResponseWriter, r *http.Request) {
	decoder := json.NewDecoder(r.Body)
	var userRequest UserRequest
	err := decoder.Decode(&userRequest)
	if err != nil {
		panic(err)
	}
	defer r.Body.Close()

	var user *User = new(User)
	getById(userRequest.Username, user)
	err = json.NewEncoder(w).Encode(user)
	if err != nil {
		panic(err)
		err = json.NewEncoder(w).Encode(&err)
	}
}

func DeleteUser(w http.ResponseWriter, r *http.Request) {
	decoder := json.NewDecoder(r.Body)
	var userRequest UserRequest
	err := decoder.Decode(&userRequest)
	if err != nil {
		panic(err)
	}
	defer r.Body.Close()

	var cas *gocb.Cas = new(gocb.Cas)
	removeUser(userRequest.Username, cas)
	err = json.NewEncoder(w).Encode(cas)
	if err != nil {
		panic(err)
		err = json.NewEncoder(w).Encode(&err)
	}
}

func Login(w http.ResponseWriter, r *http.Request) {
	decoder := json.NewDecoder(r.Body)
	var loginRequest LoginRequest
	err := decoder.Decode(&loginRequest)
	if err != nil {
		panic(err)
	}
	defer r.Body.Close()

	var response *Response = new(Response)
	login(loginRequest, response)
	err = json.NewEncoder(w).Encode(response)
	if err != nil {
		panic(err)
		err = json.NewEncoder(w).Encode(&err)
	}
}
