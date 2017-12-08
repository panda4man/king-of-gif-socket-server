import Model from './model'
import crypto from 'crypto-random-string'

export default class Room extends Model {
	constructor() {
		super();

		this.fillable = ['code', 'limit'];
		this.code = crypto(5);
	}
}