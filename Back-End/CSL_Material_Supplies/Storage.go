package main

import (
	"gopkg.in/couchbase/gocb.v1"
)

const bucketName string = "Materials";

func initialize() gocb.Bucket{
	cluster, _ := gocb.Connect("couchbase://localhost")
	cluster.Authenticate(gocb.PasswordAuthenticator{
		Username: "Administrator",
		Password: "quantumDot",
	})
	bucket, _ := cluster.OpenBucket(bucketName, "")
	bucket.Manager("", "").CreatePrimaryIndex("", true, false)
	return *bucket
}

func put(instance MaterialSupplies, response *Response){
	bucket := initialize()
	_, err := bucket.Upsert(instance.ProjectId, instance, 0)
	if err != nil {
		response.Code = -2
		response.State.Message = "Recurso no disponible"
	}else {
		response.Code = 1
		response.State.Message = "Espacio de materiales creado"
	}
	bucket.Close();
}

func getById(key string, myMaterials *MaterialSupplies, response *Response){
	bucket := initialize()
	_,err := bucket.Get(key, &myMaterials)
	if err != nil {
		response.Code = -1
		response.State.Message = "Proyecto no existe"
	}else{
		response.Code = 1
		response.State.Message = "Espacio de materiales obtenido"
	}
	bucket.Close();
}

func remove(key string, response *Response){
	bucket := initialize()
	var cas gocb.Cas
	_,err := bucket.Remove(key,cas)
	if err != nil {
		response.Code = -1
		response.State.Message = "Error eliminando el proyecto"
	}else{
		response.Code = 1
		response.State.Message = "Proyecto eliminado"
	}
	bucket.Close();
}
