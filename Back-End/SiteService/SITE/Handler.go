package main

import (
	"encoding/json"
	"net/http"
	"fmt"
)

func SaveState(w http.ResponseWriter, r *http.Request) {
	decoder := json.NewDecoder(r.Body)
	data := make(map [string] string )
	err := decoder.Decode(&data)
	if err != nil {
		panic(err)
	}
	defer r.Body.Close()
	responsefunction(w,data)
}

func DeleteState(w http.ResponseWriter, r *http.Request) {

	decoder := json.NewDecoder(r.Body)

	data := make(map [string] string )
	err := decoder.Decode(&data)
	if err != nil {
		panic(err)
	}
	defer r.Body.Close()
	responsefunction(w,data)
}

func GetState(w http.ResponseWriter, r *http.Request) {

	decoder := json.NewDecoder(r.Body)

	data := make(map [string] string )
	err := decoder.Decode(&data)
	if err != nil {
		panic(err)
	}
	defer r.Body.Close()
	responsefunction(w,data)
}

func responsefunction (w http.ResponseWriter,  data map [string] string) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Content-Type", "application/json; charset=UTF-8")
	//decoder := json.NewDecoder(r.Body)

	fmt.Println(data)
	response :=  new(Response);
	response.Code = 10
	response.State.Message = "Hola Mensaje recibido "
	err := json.NewEncoder(w).Encode(&response)
	if err != nil {
		panic(err)
	}
}
