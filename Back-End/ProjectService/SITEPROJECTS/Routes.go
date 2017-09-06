package main

var routes = Routes{
	Route{
		"UpdateProject",
		"POST",
		"/namespace/update/project/",
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
}
