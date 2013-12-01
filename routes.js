var request = require('request');

module.exports = function (app) {
	var session_id = "47fee649-a237-452a-98c4-ee653e18d48d";
	var gate_server = "http://virtual-126.fi.muni.cz:8080/GateWS";
	var svg_uri = "https://is.muni.cz/www/324899/elephants.svg";

	//upload svg to gate server
	app.get('/upload', function (req, res) {
		var path = '/svg/upload?uri=' + svg_uri;

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

		console.log(gate_server + path);

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

	app.post('/identify', function (req, res) {
		var path = "/owl/identify-subject/" + session_id + "?subjectName=elephant";

		request(gate_server + path, function (error, response, body) {
			if(error) {
				res.send(error);
				return;
			}

			res.send(body);
		});
	});
}