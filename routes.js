var request = require('request');

module.exports = function (app) {

	var HTTP_400_BAD_REQUEST = 400;


	var session_id = "b4c08f88-e51f-4077-8aba-8a580e3f0cf3";
	var gate_server = "http://virtual-126.fi.muni.cz:8080/GateWS";
	var svg_uri = "https://is.muni.cz/www/324899/elephants.svg";

	//upload svg to gate server
	app.get('/upload', function (req, res) {
		var path = '/svg/upload?jena=false&uri=' + svg_uri;
		console.log(gate_server+path);
		request(gate_server + path, function (error, response, body) {
			if(error) {
				res.send(error);
				return;
			}

			res.send(body);
		});
	});

	app.get('/annotation', function (req, res) {
		var path = '/svg/get-annotation/' + session_id;

		request(gate_server + path, function (error, response, body) {
			if(error) {
				res.send(error);
				return;
			}

			res.send(body);
		});
	});

	app.get('/svg', function (req, res) {
		var path = '/svg/get/' + session_id;

		request(gate_server + path, function (error, response, body) {
			if(error) {
				res.send(error);
				return;
			}

			res.send(body);
		});
	});

	app.post('/close', function (req, res) {
		var path = "/svg/close/" + session_id;

		request.post(gate_server + path, function (error, response, body) {
			if(error) {
				res.send(error);
				return;
			}

			res.send(body);
		});
	});

	app.post('/language', function (req, res) {
		if(typeof req.body.language === "undefined") {
			res.json(HTTP_400_BAD_REQUEST, {error: "Must specify language"});
			return;
		}

		var path = "/owl/set-language/" + session_id + "?lang=" + req.body.language;

		request(gate_server + path, function (error, response, body) {
			if(error) {
				res.send(error);
				return;
			}

			res.send(body);
		});
	});

	app.post('/identify', function (req, res) {
		if(typeof req.body.subjectName === "undefined") {
			res.json(HTTP_400_BAD_REQUEST, {error: "Must specify subjectName"});
			return;
		}

		var path = "/owl/identify-subject/" + session_id + "?subjectName=" + req.body.subjectName;

		request(gate_server + path, function (error, response, body) {
			if(error) {
				res.send(error);
				return;
			}
			json = JSON.parse(body);
			
			res.json(json);
		});
	});

	app.post('/simple', function (req, res) {
		if(typeof req.body.uri === "undefined") {
			res.json(HTTP_400_BAD_REQUEST, {error: "Must specify uri"});
			return;
		}

		if(typeof req.body.lod === "undefined") {
			res.json(HTTP_400_BAD_REQUEST, {error: "Must specify lod"});
			return;
		}

		var path = "/owl/query-subject/simple/" + session_id + "?uri=" + req.body.uri + "&lod=" + req.body.lod;
		request(gate_server + path, function (error, response, body) {
			if(error) {
				res.send(error);
				return;
			}

			res.json(clean_response(body, req.body.lod));
		});
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