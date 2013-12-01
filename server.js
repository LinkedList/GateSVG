var express = require('express');
var app = express();

app.use(express.bodyParser());

require("./routes")(app);

app.configure(function () {
	app.use(express.static(__dirname + "/static"));
});

app.listen(3000);
console.log('Listening on port 3000');
