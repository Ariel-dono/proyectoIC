package main

var routes = Routes{
	Route{
		"InsertUser",
		"POST",
		"/user/insert/",
		InsertUser,
	},
	Route{
		"UpdateUser",
		"POST",
		"/user/update/",
		UpdateUser,
	},
	Route{
		"GetUser",
		"POST",
		"/user/get/",
		GetUser,
	},
	Route{
		"Login",
		"POST",
		"/user/login/",
		Login,
	},
	Route{
		"Delete",
		"POST",
		"/user/delete/",
		DeleteUser,
	},
}
