"use strict";
const express = require("express");
const app = express();
const server = require('http').Server(app);
// const BodyParser = require("body-parser");
// const io = require('socket.io')(server);

const port = process.env.PORT || 8080;

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