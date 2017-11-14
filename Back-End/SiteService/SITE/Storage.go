package main

import (
	"gopkg.in/couchbase/gocb.v1"
)

const bucketName string = "Projects";

func initialize() gocb.Bucket{
	cluster, _ := gocb.Connect("couchbase://localhost")
	bucket, _ := cluster.OpenBucket(bucketName, "")
	bucket.Manager("", "").CreatePrimaryIndex("", true, false)
	return *bucket;
}

func put(instance RequestingProject, response *Response){

	bucket := initialize();
	var createdProject Project;
	bucket.Get(instance.Key, &createdProject)
	update_Aux(instance, bucket, response);
}

func update_Aux (instance RequestingProject, bucket gocb.Bucket, response *Response){
	_, err := bucket.Upsert(instance.Key, instance.ProjectInstance, 0);
	if err != nil {
		response.Code = -2;
		response.State.Message = "Recurso no disponible";
	}else {
		response.Code = 1;
		response.State.Message = "Proyecto creado";
	}
	bucket.Close();
}

func getById(key string, project *Project, response *Response){
	bucket := initialize()
	_,err := bucket.Get(key, &project)
	if err != nil {
		response.Code = -1;
		response.State.Message = "Proyecto no existe";
	}else{
		response.Code = 1;
		response.State.Message = "Proyecto Eliminado";
	}
	bucket.Close();
}

func remove(key string, response *Response){
	bucket := initialize()
	var cas gocb.Cas
	_,err := bucket.Remove(key,cas);
	if err != nil {
		response.Code = -1;
		response.State.Message = "Error eliminando el proyecto";
	}else{
		response.Code = 1;
		response.State.Message = "Proyecto eliminado";
	}
	bucket.Close();
}
