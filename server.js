var express = require('express');  
var app = express();  
var server = require('http').createServer(app);  
var io = require('socket.io')(server);
var ioServer = require('./websocket')(io);

server.listen(process.env.PORT || 4240);

app.get('/', function (req, res) {
	res.send('Welcome :)');
});
