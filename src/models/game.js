import crypto from 'crypto-random-string'
import Model from './model'

export default class Game extends Model {
	constructor() {
		super();

		this.fillable = ['room'];
		this.id = crypto(6);
		this.rounds = [];
		this.players = [];

		let roundOne = {
			started: false,
			questions: [],
			questionsSubmitted: false,
			responses: [],
			responsesSubmitted: false,
			completed: false
		};

		let roundTwo = {
			started: false,
			questions: [],
			questionsSubmitted: false,
			responses: [],
			responsesSubmitted: false,
			completed: false
		};

		this.rounds.push(roundOne);
		this.rounds.push(roundTwo);
	}
}