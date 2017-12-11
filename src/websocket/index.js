import RoomRepository from '../repositories/room-repo'
import PlayerRepository from '../repositories/player-repo'
import GameRepository from '../repositories/game-repo'

let players = [];
let rooms = [];
let games = [];

const IO = (io) => {
    let roomRepo = new RoomRepository(rooms);
    let playerRepo = new PlayerRepository(players);
    let gameRepo = new GameRepository(games);

    io.on('connection', (socket) => {
        console.log(socket.id);

        //Host trying to create a new game
        socket.on('game-create', () => {
            let room = roomRepo.create({limit: 12 });
            playerRepo.create({
                is_host: true,
                socket_id: socket.id,
                username: null,
                room: room.code
            });

            socket.join(room.code);
            socket.emit('game-created', room.code);
        });

        //Player trying to join a game room
        socket.on('room-join', (data) => {
            let room = roomRepo.findByCode(data.roomCode);

            //See if room exists
            if(room) {
                let roomHost = playerRepo.findRoomHost(room.code);

                //Make sure the room has a host
                if(roomHost) {
                    let roomPlayers = playerRepo.findByRoom(room.code);

                    //Check if room is already full
                    if(roomPlayers.length == room.limit) {
                        socket.emit('room-full');
                    } else {
                        let player = playerRepo.create({
                            is_host: false,
                            socket_id: socket.id,
                            username: data.username,
                            room: room.code
                        });

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
            let player = playerRepo.findOneBySocket(socket.id);

            let success = playerRepo.destroy(socket.id);
            let roomPlayers = playerRepo.findByRoom(roomCode, true);

            //Clean up empty rooms
            if(roomPlayers.length == 0) {
                roomRepo.destroy(roomCode);
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
            let player = playerRepo.findOneBySocket(socket.id);

            if (player !== null) {
                let roomPlayers = playerRepo.findByRoom(roomCode, true);

                socket.emit('room-joined-confirmed', roomPlayers);
                socket.to(player.room).emit('player-joined', roomPlayers);
            } else {
                socket.emit('room-joined-404');
            }
        });

        //First player wants to start the game
        socket.on('game-start', (roomCode) => {
            let g = gameRepo.create({room: roomCode, io: io});

            //Tell all room participants the game is starting
            io.in(roomCode).emit('game-starting', {gameId: g.id});
        });

        //Someone joined the game
        socket.on('game-joined', (gameId) => {
            let game = gameRepo.findById(gameId);
            let player = playerRepo.findOneBySocket(socket.id);

            if(!game || !player) {
                socket.emit('game-joined-404');

                return false;
            }

            if(game.room !== player.room) {
                socket.emit('game-joined-400', {error: 'You do not belong to this game\'s room'});

                return false;
            }

            let alreadyJoined = gameRepo.playerJoined(game, player);

            if(!alreadyJoined) {
                let success = gameRepo.joinGame(game.id, player);

                if(success) {
                    game = gameRepo.findById(gameId);

                    socket.emit('game-joined-success', game);
                } else {
                    socket.emit('game-joined-400', {error: 'Could not join the game'});
                }
            } else {
                socket.emit('game-joined-success');
            }
        });

        //Client wants to know it's player data
        socket.on('player-get', (gameId) => {
            let player = playerRepo.findOneBySocket(socket.id);
            let game = gameRepo.findById(gameId);
            let gamePlayer = game.players.filter(p => p.socket_id === player.socket_id);

            if(gamePlayer.length) {
                socket.emit('player-got', player);
            } else {
                socket.emit('player-got-404');
            }
        });

        //Disconnected
        socket.on('disconnect', () => {
            console.log('Someone disconnected');
            let player = playerRepo.findOneBySocket(socket.id);
            let success = playerRepo.destroy(socket.id);

            if(player) {
                let roomPlayers = playerRepo.findByRoom(player.room, true);

                if(player.is_host) {
                    console.log('The host left room: ' + player.room);

                    socket.to(player.room).emit('host-left');
                } else {
                    console.log('A player left the room: ' + player.room);

                    socket.to(player.room).emit('player-left', roomPlayers);
                }
            }
        });
    });
}

export default IO