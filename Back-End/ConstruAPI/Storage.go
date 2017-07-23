package main

import (
	"gopkg.in/couchbase/gocb.v1"
)

func initialize() gocb.Bucket{
	cluster, _ := gocb.Connect("couchbase://localhost")
	bucket, _ := cluster.OpenBucket("Proyecto", "")
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
		_, err := bucket.Upsert(user.Username, user, 0);
		if err != nil {
			response.Code = -2;
			response.State.Message = "Recurso no disponible";
		}
		response.Code = 200;
		response.State.Message = "Operacion Exitosa";
	}
}

func getById(id string, user *User){
	bucket := initialize()
	bucket.Get(id, &user)
}

func removeUser(id string, user *gocb.Cas){
	bucket := initialize()
	var cas gocb.Cas
	bucket.Remove(id,cas)
}

func login(user LoginRequest, response *Response) {
	bucket := initialize();
	// Use query
	query := gocb.NewN1qlQuery("SELECT * FROM Proyecto Where username = $1 and pass = $2")
	rows, _ := bucket.ExecuteN1qlQuery(query, []interface{}{user.AuthName, user.AuthPass})
	row := make(map[string]User)
	var userQuery []User
	for rows.Next(&row) {
		userQuery = append(userQuery, row["Proyecto"])
	}

	if(len(userQuery) > 0) {
		response.Code = 1;
		response.State.Message = "Iniciado con éxito";
	}else{
		response.Code = -1;
		response.State.Message = "Error iniciando";
	}

}
