import Model from './model'

export default class Room extends Model {
	constructor() {
		super();

		this.fillable = ['code', 'limit'];
	}
}