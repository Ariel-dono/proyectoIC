package main


var routes = Routes{
	Route{
		"SaveState",
		"POST",
		"/project/save/",
		SaveState,
	},
	Route{
		"DeleteState",
		"POST",
		"/project/delete/",
		DeleteState,
	},
	Route{
		"GetState",
		"POST",
		"/project/get/",
		GetState,
	},
}
