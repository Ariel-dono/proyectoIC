package main

import (
	"gopkg.in/couchbase/gocb.v1"
	"strings"
)

const bucketName string = "Users";

func initialize() gocb.Bucket{
	cluster, _ := gocb.Connect("couchbase://localhost")
	bucket, _ := cluster.OpenBucket(bucketName, "")
	bucket.Manager("", "").CreatePrimaryIndex("", true, false)
	return *bucket;
}

func put(user User, response *Response){
	bucket := initialize();
	var createdUser User;
	bucket.Get(user.Username, &createdUser)
	if(createdUser.Username != ""){
		response.Code = -1;
		response.State.Message = "Usuario existente";
	}else {
		update_Aux(user, bucket, response);
	}
}

func update(user User, response *Response){
	bucket := initialize();
	var createdUser User;
	bucket.Get(user.Username, &createdUser)
	if(createdUser.Username == ""){
		response.Code = -1;
		response.State.Message = "Usuario no existe";
	}else {
		update_Aux(user, bucket, response);
	}
}

func update_Aux (user User, bucket gocb.Bucket, response *Response){
	_, err := bucket.Upsert(user.Username, user, 0);
	if err != nil {
		response.Code = -2;
		response.State.Message = "Recurso no disponible";
	}
	response.Code = 200;
	response.State.Message = "Operacion Exitosa";
	bucket.Close();
}

func getById(id string, user *User, response *Response){
	bucket := initialize()
	_,err := bucket.Get(id, &user)
	if err != nil {
		response.Code = -1;
		response.State.Message = "Usuario no existe";
	}
	bucket.Close();
}

func removeUser(id string, response *Response){
	bucket := initialize()
	var cas gocb.Cas
	_,err := bucket.Remove(id,cas);
	if err != nil {
		response.Code = -1;
		response.State.Message = "Error eliminando el usuario";
	}else{
		response.Code = 1;
		response.State.Message = "Usuario eliminado";
	}
	bucket.Close();
}

func login(auth LoginRequest, response *Response) {
	var loggedUser *User = new(User)
	getById(auth.AuthName, loggedUser, response)
	if(strings.Compare(loggedUser.Password, auth.AuthPass) == 0) {
		response.Code = 1;
		response.State.Message = "Iniciado con éxito";
	}else{
		response.Code = -1;
		response.State.Message = "Error iniciando";
	}
}
