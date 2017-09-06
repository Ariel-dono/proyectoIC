package main

import (
	"encoding/json"
	"net/http"
)

func InsertUser(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Content-Type", "application/json; charset=UTF-8")
	decoder := json.NewDecoder(r.Body)
	var user User
	err := decoder.Decode(&user)
	if err != nil {
		panic(err)
	}
	defer r.Body.Close()

	var response *Response = new(Response);
	if (user.Username == "" || user.Email == "" || user.Password == ""){
		response.Code = -2;
		response.State.Message = "Parametros invalidos";
		err = json.NewEncoder(w).Encode(response);
	}else {
		put(user, response)
		w.WriteHeader(http.StatusOK)
		err = json.NewEncoder(w).Encode(response)
		if err != nil {
			panic(err)
			err = json.NewEncoder(w).Encode(&err)
		}
	}
}

func UpdateUser(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Content-Type", "application/json; charset=UTF-8")
	decoder := json.NewDecoder(r.Body)
	var user User
	err := decoder.Decode(&user)
	if err != nil {
		panic(err)
	}
	defer r.Body.Close()

	var response *Response = new(Response);
	if (user.Username == "" || user.Email == "" || user.Password == ""){
		response.Code = -3;
		response.State.Message = "Parametros invalidos";
		err = json.NewEncoder(w).Encode(response);
	}else {
		update(user, response)
		w.WriteHeader(http.StatusOK)
		err = json.NewEncoder(w).Encode(response)
		if err != nil {
			panic(err)
			err = json.NewEncoder(w).Encode(&err)
		}
	}
}

func GetUser(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Content-Type", "application/json; charset=UTF-8")
	decoder := json.NewDecoder(r.Body)
	var userRequest UserRequest
	err := decoder.Decode(&userRequest)
	if err != nil {
		panic(err)
	}
	defer r.Body.Close()

	var response *Response = new(Response)
	if (userRequest.Username == ""){
		response.Code = -1;
		response.State.Message = "Parametros invalidos";
		err = json.NewEncoder(w).Encode(response);
	}else {
		if err != nil {
			response.Code = -2;
			response.State.Message = "El usuario no ha sido creado";
			err = json.NewEncoder(w).Encode(response)
			panic(err)
		}else {
			var user *User = new(User)
			getById(userRequest.Username, user, response)
			w.WriteHeader(http.StatusOK)
			err = json.NewEncoder(w).Encode(user)
		}
	}
}

func DeleteUser(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Content-Type", "application/json; charset=UTF-8")
	decoder := json.NewDecoder(r.Body)
	var userRequest UserRequest
	err := decoder.Decode(&userRequest)
	if err != nil {
		panic(err)
	}
	defer r.Body.Close()

	var response *Response = new(Response)
	if (userRequest.Username == ""){
		response.Code = -2;
		response.State.Message = "Parametros invalidos";
		err = json.NewEncoder(w).Encode(response);
	}else {
		removeUser(userRequest.Username, response)
		w.WriteHeader(http.StatusOK)
		err = json.NewEncoder(w).Encode(response)
		if err != nil {
			panic(err)
			err = json.NewEncoder(w).Encode(&err)
		}
	}
}

func Login(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Content-Type", "application/json; charset=UTF-8")
	decoder := json.NewDecoder(r.Body)
	var loginRequest LoginRequest
	err := decoder.Decode(&loginRequest)
	if err != nil {
		panic(err)
	}
	defer r.Body.Close()
	var response *Response = new(Response)
	if (loginRequest.AuthPass == "" || loginRequest.AuthName == "") {
		response.Code = -2;
		response.State.Message = "Parametros invalidos";
		err = json.NewEncoder(w).Encode(response)
	}else{
		login(loginRequest, response)
		w.WriteHeader(http.StatusOK)
		err = json.NewEncoder(w).Encode(response)
		if err != nil {
			panic(err)
			err = json.NewEncoder(w).Encode(&err)
		}
	}
}
