import crypto from 'crypto-random-string'
import Model from './model'

export default class Game extends Model {
	constructor() {
		super();

		this.fillable = ['room', 'io'];
		this.id = crypto(6);
		this.rounds = [];
		this.players = [];
		this.eventLoop = null;

		let roundOne = {
			id: 'round-1',
			started: false,
			questionsTimer: null,
			questionsTimerVal: null,
			questions: [],
			questionsSubmitted: false,
			questionsCompleted: false,
			responses: [],
			responsesTimer: null,
			responesTimerVal: null,
			responsesSubmitted: false,
			responsesCompleted: false,
			completed: false,
			votesTimer: null,
			votesTimerVal: null,
			votesSubmitted: false,
			votes: []
		};

		let roundTwo = {
			id: 'round-2',
			started: false,
			questionsTimer: null,
			questionsTimerVal: null,
			questions: [],
			questionsSubmitted: false,
			questionsCompleted: false,
			responses: [],
			responsesTimer: null,
			responesTimerVal: null,
			responsesSubmitted: false,
			responsesCompleted: false,
			completed: false,
			votesTimer: null,
			votesTimerVal: null,
			votesSubmitted: false,
			votes: []
		};

		this.rounds.push(roundOne);
		this.rounds.push(roundTwo);
	}

	/**
	 * Kick off the game loop
	 * 
	 * @return {[type]}
	 */
	start() {
		this.eventLoop = setInterval(this.checkGameState, 100);
	}

	/**
	 * Stop the game
	 * 
	 * @return {[type]}
	 */
	stop() {
		clearInterval(this.eventLoop);
	}

	checkGameState() {
		let i, activeRound;

		//Grab the active round starting it if need be
		for(i = 0; i < this.rounds.length; i++) {
			let roundId = `round-${i+1}`;

			if(this.rounds[i].id === roundId) {
				if(this.rounds[i].completed) {
					continue;
				}

				activeRound = i;

				if(!this.rounds[i].started) {
					this.rounds[i].started = true;

					this.notifyRoundStarting((activeRound+1));
				}
			}
		}

		//No active rounds then geet out
		if(!activeRound) {
			this.stop();

			return;
		}

		/*
		 * Questions Related Logic
		 * 
		 * If timer has not been started and not all questions submitted
		 * then we start the timer
		 * 
		 * ELSE
		 *
		 * Timer has been started and all questions submitted
		 */
		if(this.rounds[activeRound].questionsTimer == null 
			&& !this.rounds[activeRound].questionsSubmitted) {

			this.rounds[activeRound].questionsTimerVal = 70;
			this.rounds[activeRound].questionsTimer = setInterval(() => {
				if(this.rounds[activeRound].questionsTimerVal > 0) {
					//do the countdown
					this.rounds[activeRound].questionsTimerVal -= 1;

					//If all questions submitted then we can move on
					if(this.rounds[activeRound].questions.length == this.getPlayersWithoutHost().length) {
						this.rounds[activeRound].questionsSubmitted = true;	
					}
				} else {
					//set submitted to true since the time ran out
					this.rounds[activeRound].questionsSubmitted = true;
				}
			}, 1000);
		} else {
			if(!this.rounds[activeRound].questionsCompleted) {
				this.notifyQuestionsTimeOut((activeRound + 1));
				clearInterval(this.rounds[activeRound].questionsTimer);
				this.rounds[activeRound].questionsCompleted = true;
			}
		}

		/*
		 * Responses Related Logic
		 */
		if(this.rounds[activeRound].questionsCompleted 
			&& !this.rounds[activeRound].responsesCompleted) {

			/*
			 * If timer has not been started and not all responses submitted
			 * then we start the timer
			 * 
			 * ELSE
			 *
			 * Timer has been started and all responses submitted
			 */
			if(this.rounds[activeRound].responsesTimer == null 
				&& !this.rounds[activeRound].responsesSubmitted) {

				this.rounds[activeRound].responesTimerVal = 70;
				this.rounds[activeRound].responsesTimer = setInterval(() => {
					if(this.rounds[activeRound].responesTimerVal > 0) {
						//do the countdown
						this.rounds[activeRound].responesTimerVal -= 1;

						//If all questions submitted then we can move on
						if(this.rounds[activeRound].responses.length == this.getPlayersWithoutHost().length) {
							this.rounds[activeRound].responsesSubmitted = true;	
						}
					} else {
						//set submitted to true since the time ran out
						this.rounds[activeRound].responsesSubmitted = true;
					}
				}, 1000);
			} else {
				if(!this.rounds[activeRound].responsesCompleted) {
					this.notifyResponsesTimeOut((activeRound + 1));
					clearInterval(this.rounds[activeRound].responsesTimer);
					this.rounds[activeRound].responsesCompleted = true;
				}
			}
		}

		/*
		 * Questions Completed && Responses Completed
		 */
		if(this.rounds[activeRound].questionsCompleted 
			&& this.rounds[activeRound].responsesCompleted) {

			this.rounds[activeRound].completed = true;
		}
	}

	notifyRoundStarting(roundNumber) {
		this.io.in(this.room).emit('round-starting', roundNumber);
	}

	notifyQuestionsTimeOut(roundNumber) {
		this.io.in(this.room).emit('round-questions-done', roundNumber);
	}

	notifyResponsesTimeOut(roundNumber) {
		this.io.in(this.room).emit('round-responses-done', roundNumber);
	}

	getPlayersWithoutHost() {
		return this.players.filter(p => {
			return !p.is_host;
		});
	}

	nextRoundExists(currentRound) {
		let r = this.rounds.filter(r => {
			return r.id === `round-${currentRound + 1}`;
		});

		return r.length > 0;
	}
}