import express from 'express'
import http from 'http'
import socketio from 'socket.io'
import websocket from './websocket'

const app = express();
let server = http.createServer(app);  
let io = socketio(server);

websocket(io);

server.listen(process.env.PORT || 4240);

app.get('/', (req, res) => {
	res.send('Welcome :)');
});
