package main

import (
	"gopkg.in/couchbase/gocb.v1"

)

const bucketName string = "Namespacing";

func initialize() gocb.Bucket {
	cluster, _ := gocb.Connect("couchbase://localhost")
	bucket, _ := cluster.OpenBucket(bucketName, "")
	bucket.Manager("", "").CreatePrimaryIndex("", true, false)
	return *bucket;
}

func getNamespace(key string, namespace *Namespace, response *Response){
	bucket := initialize()
	_,err := bucket.Get(key, &namespace)
	if err != nil || namespace.Username == ""{
		response.Code = -1;
		response.State.Message = "Namespace no existe";
	}else{
		response.Code = 1;
		response.State.Message = "Namespace Eliminado";
	}
	bucket.Close();
}

func CreateBucket (user string, response *Response){
	bucket := initialize()
	var namespace *Namespace = new(Namespace)
	namespace.Username = user
	_, err := bucket.Upsert(user, namespace, 0);
	if err != nil {
		response.Code = -1;
		response.State.Message = "Recurso no disponible";
	}else{
		response.Code = 1;
		response.State.Message = "Operacion Exitosa";
	}
	bucket.Close();
}

func DeleteBucket (user string, response *Response){
	bucket := initialize()
	var cas gocb.Cas
	_, err := bucket.Remove(user, cas);
	if err != nil {
		response.Code = -1;
		response.State.Message = "Recurso no disponible";
	}else{
		response.Code = 1;
		response.State.Message = "Operacion Exitosa";
	}
	bucket.Close();
}

func UpdateProjectName (user string, response *Response, namespace Namespace){
	bucket := initialize()
	_, err := bucket.Upsert(user, namespace, 0);
	if err != nil {
		response.Code = -2;
		response.State.Message = "Recurso no disponible";
	}else{
		response.Code = 1;
		response.State.Message = "Operacion Exitosa";
	}
	bucket.Close();
}