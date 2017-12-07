export default class Model {
	construct() {
		this.fillable = [];
	}

	fill(attributes = {}) {
		for(let k in attributes) {
			if(this.fillable.indexOf(k) > -1) {
				this[k] = attributes[k];
			}
		}

		return this;
	}

	static create(attributes = {}) {
		let p = new this();
		p.fill(attributes);

		return p;
	}
}