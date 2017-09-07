package main

import (
	"gopkg.in/couchbase/gocb.v1"

)

const bucketName string = "Namespacing";

func inicialize() gocb.Bucket {
	cluster, _ := gocb.Connect("couchbase://localhost")
	bucket, _ := cluster.OpenBucket(bucketName, "")
	bucket.Manager("", "").CreatePrimaryIndex("", true, false)
	return *bucket;
}

func CreateBucket (user string, response *Response){
	bucket := inicialize()
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

}

func DeleteBucket (user string, response *Response){
	bucket := inicialize()
	var cas gocb.Cas
	_, err := bucket.Remove(user, cas);
	if err != nil {
		response.Code = -1;
		response.State.Message = "Recurso no disponible";
	}else{
		response.Code = 1;
		response.State.Message = "Operacion Exitosa";
	}
}

func UpdateProjectName (user string, response *Response, namespace Namespace){
	bucket := inicialize()
	_, err := bucket.Upsert(user, namespace, 0);
	if err != nil {
		response.Code = -2;
		response.State.Message = "Recurso no disponible";
	}else{
		response.Code = 1;
		response.State.Message = "Operacion Exitosa";
	}
}