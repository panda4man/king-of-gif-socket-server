var crypto = require('crypto-random-string');
var players = [];
var rooms = [];

function IO(io) {
    io.on('connection', function(socket) {
        console.log(socket.id);

        //Host trying to create a new game
        socket.on('game-create', function() {
            var roomCode = crypto(5);

            rooms.push({ code: roomCode, limit: 12 });
            players.push({
                isHost: true,
                id: socket.id,
                username: null,
                room: roomCode
            });

            socket.join(roomCode);
            socket.emit('game-created', roomCode);
        });

        //Player trying to join a game lobby
        socket.on('room-join', function(data) {
        	var room = rooms.filter(function (r) {
        		return r.code === data.roomCode;
        	});

        	//See if room exists
        	if(room && room.length) {
        		room = room[0];

        		var roomHost = players.filter(function (p) {
        			return p.room === room.code && p.isHost;
        		});

        		//Make sure the room has a host
        		if(roomHost && roomHost.length) {
        			var roomPlayers = players.filter(function (p) {
        				return p.room === room.code && !p.isHost;
        			});

        			//Check if room is already full
        			if(roomPlayers && roomPlayers.length == room.limit) {
        				socket.emit('room-full');
        			} else {
        				players.push({
			                isHost: false,
			                id: socket.id,
			                username: data.username,
			                room: room.code
			            });

		        		console.log('Players in room: ' + room.code);
			            console.log(players);

			            socket.join(room.code);
			            socket.emit('room-joined');
        			}
        		} else {
        			socket.emit('room-no-host');
        		}
        	} else {
        		socket.emit('room-404');
        	}
        });

        //Player left the lobby
        socket.on('room-left', function (roomCode) {
        	let player = null;

        	//Remove the player from the players list
        	players = players.filter(function (p) {
        		if(p.id === socket.id)
        			player = p;

        		return p.id !== socket.id;
        	});

        	//Clean up empty rooms
        	roomPlayers = players.filter(function (p) {
        		return p.room === roomCode;
        	});

        	if(!roomPlayers || roomPlayers.length == 0) {
        		rooms = rooms.filter(function (r) {
        			return r.code !== roomCode;
        		});
        	}

        	//if player is the host notify everyone else
        	if(player && player.isHost) {
        		console.log('The host left room: ' + roomCode);
        		socket.to(player.room).emit('host-left');
        	} else {
        		console.log('A player left the room: ' + roomCode);
        	}

        	//leave the room
        	socket.leave(roomCode);
        });

        //Player successfully landed in the lobby
        socket.on('lobby-joined', function() {
            var player = players.filter(function(p) {
                return p.id === socket.id;
            });

            if (player.length) {
                player = player[0];
            } else {
                player = null;
            }

            if (player !== null) {
                socket.emit('lobby-joined-confirmed', player);
                socket.to(player.room).emit('player-joined', player);
            }
        });
    });
}

module.exports = IO;