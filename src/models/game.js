import crypto from 'crypto-random-string'
import Model from './model'

export default class Game extends Model {
	constructor() {
		super();

		this.fillable = ['room', 'round'];
		this.id = crypto(6);
	}
}