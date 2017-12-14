import Model from './model'

export default class Response extends Model {
	constructor() {
		super();

		this.fillable = ['gif_url', 'question_id'];
	}
}