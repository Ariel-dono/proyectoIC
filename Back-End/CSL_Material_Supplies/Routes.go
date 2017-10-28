package main


var routes = Routes{
	Route{
		"Save",
		"POST",
		"/materialsspace/save/",
		Save,
	},
	Route{
		"Delete",
		"POST",
		"/materialsspace/delete/",
		Delete,
	},
	Route{
		"Get",
		"POST",
		"/materialsspace/get/",
		Get,
	},
}

