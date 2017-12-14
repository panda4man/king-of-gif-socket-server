import Game from '../models/game'
import Question from '../models/question'

export default class GameRepository {
	constructor(games) {
		this.games = games;
	}

	/**
	 * Create a new game
	 * 
	 * @param  {Object} attributes
	 * @return {[type]}           
	 */
	create(attributes = {}) {
		let g = Game.create(attributes);
		this.games.push(g);
		
		return g;
	}

	/**
	 * Find a game by id
	 * 
	 * @param  {[type]} gameId
	 * @return {[type]}       
	 */
	findById(gameId) {
		let g = this.games.filter(g => g.id === gameId);

		if(g.length) {
			return g[0];
		}

		return null;
	}

	/**
	 * Join a player to a game
	 * 
	 * @param  {[type]} gameId
	 * @param  {[type]} player
	 * @return {[type]}       
	 */
	joinGame(gameId, player) {
		let found = false;

		for(let i = 0; i < this.games.length; i++) {
			let g = this.games[i];

			if(g.id === gameId) {
				found = true;
				this.games[i].players.push(player);
			}

			if(found)
				break;
		}

		return found;
	}

	/**
	 * Check if a player has joined the game yet.
	 * 
	 * @param  {[type]} game    
	 * @param  {[type]} socketId
	 * @return {[type]}         
	 */
	playerJoined(game, socketId) {
		let found = game.players.filter(p => {
			return p.socket_id == socketId;
		});

		return found.length;
	}

	/**
	 * Add a question to a game round
	 * 
	 * @param {[type]} gameId  
	 * @param {[type]} questionData
	 * @param {[type]} round   
	 */
	addQuestion(gameId, questionData, round) {
		let i = null, found = false;

		for(i = 0; i < this.games.length; i++) {
			if(this.games[i].id === gameId) {
				break;
			}
		}

		if(i !== null) {
			found = true;
			let q = Question.create(questionData);
			this.games[i].rounds[round].questions.push(q);
		}

		return found;
	}
}