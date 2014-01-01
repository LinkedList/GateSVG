var request = require('request');
var http = require('http');

module.exports = function (app) {

	var HTTP_200_OK = 200;
	var HTTP_400_BAD_REQUEST = 400;
	var HTTP_500_INTERNAL_SERVER_ERROR = 500;

	var gate_server = "http://virtual-126.fi.muni.cz:8080/GateWS";
	var svg_uri = "https://is.muni.cz/www/324899/elephants.svg";

	//test if server is reachable
	app.get('/test', function (req, res) {
		console.log("Testing server reachability..");
		request({ uri: gate_server, timeout:"5000" }, function (error, response, body) {
			if(error) {
				console.log("Server is not reachable..");
				console.log("Error: " + error.message);
				res.json({
					error: error,
					status: "Server is not reachable"
				});
				return;
			} else {
				console.log("Serves is reachable and responding..");
				res.json({
					status: "Server is reachable"
				});
				return;
			}
			
		});
	});

	//upload svg to gate server
	app.get('/upload', function (req, res) {
		var path = '/svg/upload?jena=false&uri=' + svg_uri;

		console.log("Uploading svg..");

		request(gate_server + path, function (error, response, body) {
			if(error) {
				res.json(HTTP_500_INTERNAL_SERVER_ERROR, error);
				return;
			}

			if(response.statusCode !== HTTP_200_OK) {
				res.send(body);
				return;
			}

			console.log("Finished uploading svg..");

			res.send(body);
		});
	});

	app.get('/annotation', function (req, res) {
		if(typeof req.body.session_id === "undefined") {
			res.json(HTTP_400_BAD_REQUEST, {error: "Must specify session"});
			return;
		}

		var path = '/svg/get-annotation/' + req.body.session_id;

		console.log("Getting annotation..");
		console.log("SessionID: " + req.body.session_id);
		request(gate_server + path, function (error, response, body) {
			if(error) {
				res.json(HTTP_500_INTERNAL_SERVER_ERROR, error);
				return;
			}

			if(response.statusCode !== HTTP_200_OK) {
				res.send(body);
				return;
			}

			res.send(body);
		});
	});

	app.get('/svg', function (req, res) {
		if(typeof req.body.session_id === "undefined") {
			res.json(HTTP_400_BAD_REQUEST, {error: "Must specify session"});
			return;
		}

		var path = '/svg/get/' + req.body.session_id;

		console.log("Getting svg..");
		console.log("SessionID: " + req.body.session_id);

		request(gate_server + path, function (error, response, body) {
			if(error) {
				res.json(HTTP_500_INTERNAL_SERVER_ERROR, error);
				return;
			}

			if(response.statusCode !== HTTP_200_OK) {
				res.send(body);
				return;
			}

			res.send(body);
		});
	});

	app.post('/close', function (req, res) {
		if(typeof req.body.session_id === "undefined") {
			res.json(HTTP_400_BAD_REQUEST, {error: "Must specify session"});
			return;
		}

		var path = "/svg/close/" + req.body.session_id;

		console.log("Closing session.. ");
		console.log("SessionID: " + req.body.session_id);

		request.post(gate_server + path, function (error, response, body) {
			if(error) {
				res.json(HTTP_500_INTERNAL_SERVER_ERROR, error);
				return;
			}

			if(response.statusCode !== HTTP_200_OK) {
				res.send(body);
				return;
			}

			console.log(body);
			res.send(body);
		});
	});

	app.post('/language', function (req, res) {
		if(typeof req.body.session_id === "undefined") {
			res.json(HTTP_400_BAD_REQUEST, {error: "Must specify session"});
			return;
		}

		if(typeof req.body.language === "undefined") {
			res.json(HTTP_400_BAD_REQUEST, {error: "Must specify language"});
			return;
		}

		var path = "/owl/set-language/" + req.body.session_id + "?lang=" + req.body.language;

		console.log("Setting language..");
		console.log("SessionID: " + req.body.session_id);
		console.log("Language: " + req.body.language);

		request(gate_server + path, function (error, response, body) {
			if(error) {
				console.log("Error: " + error);
				res.json(HTTP_500_INTERNAL_SERVER_ERROR, error);
				return;
			}

			if(response.statusCode !== HTTP_200_OK) {
				res.send(HTTP_500_INTERNAL_SERVER_ERROR, body);
				return;
			}

			res.send(body);
		});
	});

	app.post('/identify', function (req, res) {
		if(typeof req.body.session_id === "undefined") {
			res.json(HTTP_400_BAD_REQUEST, {error: "Must specify session"});
			return;
		}

		if(typeof req.body.subjectName === "undefined") {
			res.json(HTTP_400_BAD_REQUEST, {error: "Must specify subjectName"});
			return;
		}

		var path = "/owl/identify-subject/" + req.body.session_id + "?subjectName=" + req.body.subjectName;

		console.log("Identifying subject..");
		console.log("SessionID: " + req.body.session_id);
		console.log("SubjectName: " + req.body.subjectName);

		request(gate_server + path, function (error, response, body) {
			if(error) {
				res.json(HTTP_500_INTERNAL_SERVER_ERROR, error);
				return;
			}

			if(response.statusCode !== HTTP_200_OK) {
				res.send(body);
				return;
			}
			json = JSON.parse(body);
			
			res.json(json);
		});
	});

	app.post('/simple', function (req, res) {
		if(typeof req.body.session_id === "undefined") {
			res.json(HTTP_400_BAD_REQUEST, {error: "Must specify session"});
			return;
		}

		if(typeof req.body.uri === "undefined") {
			res.json(HTTP_400_BAD_REQUEST, {error: "Must specify uri"});
			return;
		}

		if(typeof req.body.lod === "undefined") {
			res.json(HTTP_400_BAD_REQUEST, {error: "Must specify lod"});
			return;
		}

		var path = "/owl/query-subject/simple/" + req.body.session_id + "?uri=" + req.body.uri + "&lod=" + req.body.lod;

		console.log("Querying simple..");
		console.log("SessionID: " + req.body.session_id);
		console.log("Uri: " + req.body.uri);
		console.log("Lod: " + req.body.lod);

		request(gate_server + path, function (error, response, body) {
			if(error) {
				res.json(HTTP_500_INTERNAL_SERVER_ERROR, error);
				return;
			}

			if(response.statusCode !== HTTP_200_OK) {
				res.send(body);
				return;
			}

			res.json(clean_response(body, req.body.lod));
		});
	});

	app.post('/interval', function (req, res) {
		if(typeof req.body.session_id === "undefined") {
			res.json(HTTP_400_BAD_REQUEST, {error: "Must specify session"});
			return;
		}

		if(typeof req.body.uri === "undefined") {
			res.json(HTTP_400_BAD_REQUEST, {error: "Must specify uri"});
			return;
		}

		if(typeof req.body.from === "undefined") {
			res.json(HTTP_400_BAD_REQUEST, {error: "Must specify from"});
			return;
		}

		if(typeof req.body.to === "undefined") {
			res.json(HTTP_400_BAD_REQUEST, {error: "Must specify to"});
			return;
		}

		var path = "/owl/query-subject/interval/" + req.body.session_id + "?uri=" + req.body.uri + "&from=" + req.body.from + "&to=" + req.body.to;

		console.log("Querying interval..");
		console.log("SessionID: " + req.body.session_id);
		console.log("Uri: " + req.body.uri);
		console.log("From: " + req.body.from);
		console.log("To: " + req.body.to);

		request(gate_server + path, function (error, response, body) {
			if(error) {
				res.json(HTTP_500_INTERNAL_SERVER_ERROR, error);
				return;
			}

			if(response.statusCode !== HTTP_200_OK) {
				res.send(body);
				return;
			}

			res.json(clean_response(body, req.body.lod));
		});
	});

	app.post('/list', function (req, res) {
		if(typeof req.body.session_id === "undefined") {
			res.json(HTTP_400_BAD_REQUEST, {error: "Must specify session"});
			return;
		}

		if(typeof req.body.id === "undefined") {
			res.json(HTTP_400_BAD_REQUEST, {error: "Must specify id"});
			return;
		}

		if(typeof req.body.list === "undefined") {
			res.json(HTTP_400_BAD_REQUEST, {error: "Must specify from"});
			return;
		}

		var path = "/owl/query-subject/list/" + req.body.session_id + "?id=" + req.body.id + "&list=" + req.body.list;

		console.log("Querying interval..");
		console.log("SessionID: " + req.body.session_id);
		console.log("Id: " + req.body.id);
		console.log("List: " + req.body.list);

		request(gate_server + path, function (error, response, body) {
			if(error) {
				res.json(HTTP_500_INTERNAL_SERVER_ERROR, error);
				return;
			}

			if(response.statusCode !== HTTP_200_OK) {
				res.send(body);
				return;
			}

			res.json(clean_response(body, req.body.lod));
		});
	});

	app.post('/dialogue', function (req, res) {
		if(typeof req.body.session_id === "undefined") {
			res.json(HTTP_400_BAD_REQUEST, {error: "Must specify session"});
			return;
		}

		if(typeof req.body.uri === "undefined") {
			res.json(HTTP_400_BAD_REQUEST, {error: "Must specify uri"});
			return;
		}

		if(typeof req.body.query === "undefined") {
			res.json(HTTP_400_BAD_REQUEST, {error: "Must specify query"});
			return;
		}

		var path = "/owl/query-subject/dialogue/" + req.body.session_id + "?query=" + req.body.query;

		console.log("Querying dialogue..");
		console.log("SessionID: " + req.body.session_id);
		console.log("Query: " + req.body.query);

		//Temporary solution:
		res.json({
			response: "Feature not yet implemented.."
		});

		// Not yet implemented on server
		// request(gate_server + path, function (error, response, body) {
		// 	if(error) {
		// 		res.json(HTTP_500_INTERNAL_SERVER_ERROR, error);
		// 		return;
		// 	}

		// 	if(response.statusCode !== HTTP_200_OK) {
		// 		res.send(body);
		// 		return;
		// 	}

		// 	//Assumed response will need cleaning
		// 	res.json(clean_response(body, req.body.lod));
		// });
	});


	//HELPER FUNCTIONS
	function clean_response(body, lod) {
		var body_array = body.split("<;>");
		if(lod === "1") {
			return {
				label: body_array[1]
			};
		} else if(lod === "2" || lod === "4") {
			var classes_array = body_array[1].split("<,>");
			var return_array = classes_array.map(function (class_label) {
				return test_hash_and_return(class_label);
			});
			return {
				classes: return_array
			};
		} else if(lod === "7") {
			var return_object = {};

			for (var i = 1; i < body_array.length; i++) {
				var properties = body_array[i].split("<:>");
				var property = null;
				var value = null;

				property = test_hash_and_return(properties[0]);

				if(has_comma(properties[1])) {
					var temp_value = properties[1].split("<,>");
					value = temp_value.map(function (val) {
						return test_hash_and_return(val);
					});
				} else {
					value = test_hash_and_return(properties[1]);
				}

				return_object[property] = value;
			}
			return return_object;
		}
	}

	function camel_case_to_normal(string) {
		string = string.replace(/([A-Z])/g, ' $1')
					   .replace(/^./, function(str){ 
							return str.toUpperCase(); 
						});
		return string;
	}

	function has_hash(string) {
		return string.indexOf("#") !== -1;
	}

	function has_comma(string) {
		return string.indexOf("<,>") !== -1;
	}

	function test_hash_and_return(string) {
		if(has_hash(string)) {
			return camel_case_to_normal(string.split("#")[1]);
		} else {
			return camel_case_to_normal(string);
		}
	}
}