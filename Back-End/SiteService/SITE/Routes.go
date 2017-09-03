package main


var routes = Routes{
	Route{
		"SaveState",
		"POST",
		"/state/save/",
		SaveState,
	},
	Route{
		"DeleteState",
		"POST",
		"/state/delete/",
		DeleteState,
	},
	Route{
		"GetState",
		"POST",
		"/state/get/",
		GetState,
	},
}
