package main

var routes = Routes{
	Route{
		"UpdateProject",
		"POST",
		"/namespace/update/projects/",
		UpdateProject,
	},
	Route{
		"CreateNamespace",
		"POST",
		"/namespace/create/",
		CreateNamespace,
	},
	Route{
		"DeleteNamespace",
		"POST",
		"/namespace/delete/",
		DeleteNamespace,
	},
	Route{
		"GetNamespace",
		"POST",
		"/namespace/get/",
		GetNamespace,
	},
}
