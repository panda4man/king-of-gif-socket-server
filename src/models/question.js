import Model from './model'
import UUID from 'uuid/v4'

export default class Question extends Model {
	constructor() {
		super();

		this.fillable = ['gif_url', 'text', 'player_id'];
		this.id = UUID();
	}
}