import crypto from 'crypto-random-string'
import Player from '../models/player'
import Room from '../models/room'

let players = [];
let rooms = [];

const IO = (io) => {
    io.on('connection', (socket) => {
        console.log(socket.id);

        //Host trying to create a new game
        socket.on('game-create', () => {
            let roomCode = crypto(5);
            let room = Room.create({ code: roomCode, limit: 12 });
            let player = Player.create({
                is_host: true,
                socket_id: socket.id,
                username: null,
                room: roomCode
            });

            rooms.push(room);
            players.push(player);

            socket.join(roomCode);
            socket.emit('game-created', roomCode);
        });

        //Player trying to join a game room
        socket.on('room-join', (data) => {
            let room = rooms.filter(r => {
                return r.code === data.roomCode;
            });

            //See if room exists
            if(room && room.length) {
                room = room[0];

                let roomHost = players.filter(p => {
                    return p.room === room.code && p.is_host;
                });

                //Make sure the room has a host
                if(roomHost && roomHost.length) {
                    let roomPlayers = players.filter(p => {
                        return p.room === room.code && !p.is_host;
                    });

                    //Check if room is already full
                    if(roomPlayers && roomPlayers.length == room.limit) {
                        socket.emit('room-full');
                    } else {
                        let player = Player.create({
                            is_host: false,
                            socket_id: socket.id,
                            username: data.username,
                            room: room.code
                        });

                        players.push(player);

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

        //Player left the room
        socket.on('room-left', roomCode => {
            let player = null;

            //Remove the player from the players list
            players = players.filter(p => {
                if(p.socket_id === socket.id)
                    player = p;

                return p.socket_id !== socket.id;
            });

            //Clean up empty rooms
            let roomPlayers = players.filter(p => {
                return p.room === roomCode;
            });

            if(!roomPlayers || roomPlayers.length == 0) {
                rooms = rooms.filter(r => {
                    return r.code !== roomCode;
                });
            }

            if(player) {
                if(player.is_host) {
                    console.log('The host left room: ' + roomCode);

                    socket.to(player.room).emit('host-left');
                } else {
                    console.log('A player left the room: ' + roomCode);

                    socket.to(player.room).emit('player-left', roomPlayers);
                }
            }

            //leave the room
            socket.leave(roomCode);
        });

        //Player successfully landed in the room
        socket.on('room-joined', (roomCode) => {
            let player = players.filter(p => {
                return p.socket_id === socket.id;
            });

            if (player.length) {
                player = player[0];
            } else {
                player = null;
            }

            if (player !== null) {
                let roomPlayers = players.filter(p => {
                    return p.room == roomCode;
                });

                console.log('room players');
                console.log(roomPlayers);

                socket.emit('room-joined-confirmed', roomPlayers);
                socket.to(player.room).emit('player-joined', roomPlayers);
            } else {
                socket.emit('room-joined-404');
            }
        });
    });
}

export default IO