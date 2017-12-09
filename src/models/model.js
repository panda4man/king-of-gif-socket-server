export default class Model {
	constructor() {
		this.fillable = [];
		this.hidden = ['fillable', 'defaults'];
		this.defaults = {};
	}

	fill(attributes = {}) {
		for(let k in attributes) {
			if(this.fillable.indexOf(k) > -1) {
				this[k] = attributes[k];
			}
		}

		return this;
	}

	toJson() {
		let data = {};

		for(let k in this) {
			if(this.hidden.indexOf(k) == -1) {
				data[k] = this[k];
			}
		}

		return data;
	}

	static create(attributes = {}) {
		let p = new this();
		p.fill(attributes);

		return p;
	}
}