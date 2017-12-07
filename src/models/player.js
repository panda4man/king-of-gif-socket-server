import Model from './model'

export default class Player extends Model {
	constructor() {
		super();

		this.fillable = ['is_host', 'socket_id', 'username', 'room'];
	}
}