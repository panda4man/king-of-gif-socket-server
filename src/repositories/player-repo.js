import Player from '../models/player'

export default class PlayerRepository {
	constructor(players) {
		this.players = players;
	}

	/**
	 * Create a new player
	 * 
	 * @param  {Object} attributes
	 * @return Player
	 */
	create(attributes = {}) {
		let p = Player.create(attributes);

		this.players.push(p);

		return p;
	}

	/**
	 * Remove a player
	 * 
	 * @param  {[type]} socketId
	 * @return {[type]}         
	 */
	destroy(socketId) {
		let found = false;

		this.players = this.players.filter(p => {
			if(p.socket_id === socketId)
				found = true;

			return p.socket_id !== socketId;
		});

		return found;
	}

	/**
	 * Find players by room
	 * 
	 * @param  {String} roomCode
	 * @return {[type]}         
	 */
	findByRoom(roomCode = '', includeHost = false) {
		let p = this.players.filter(p => {
			if(includeHost) {
				return p.room === roomCode;
			} else {
				return p.room === roomCode && !p.is_host;
			}
		}).map(p => {
			return p.toJson();
		});

		return p;
	}

	/**
	 * Find a single player by socket_id
	 * 
	 * @param  {String} socketId
	 * @return {[type]}         
	 */
	findOneBySocket(socketId = '') {
		let p = this.players.filter(p => {
			return p.socket_id === socketId;
		}).map(p => {
			return p.toJson();
		});

		if(p.length) {
			return p[0];
		}

		return null;
	}

	findRoomHost(roomCode = '') {
		let p = this.players.filter(p => {
			return p.room === roomCode && p.is_host;
		}).map(p => {
			return p.toJson();
		});

		if(p.length) {
			return p[0];
		}

		return null;
	}
}