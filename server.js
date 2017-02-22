"use strict";
var express = require("express");
var app = express();
var server = require('http').Server(app);
// var BodyParser = require("body-parser");
// var io = require('socket.io')(server);

var port = process.env.PORT || 8080;

app.set('view engine', 'ejs');

// app.use(BodyParser.json());
// app.use(BodyParser.urlencoded({
// 	extended: true
// }));

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
	res.render('index');
	res.end()
});
app.post('/test', function(req, res) {
	res.send(test())
	res.end()
});

function test(){
	return {message:"It's working!"};
}

server.listen(port, function() {
	console.log('Server Started on port ' + port)
});