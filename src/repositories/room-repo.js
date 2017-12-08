import Room from '../models/room'

export default class RoomRepository {
	constructor(rooms) {
		this.rooms = rooms;
	}

	/**
	 * Create a new room
	 * 
	 * @param  {Object} attributes
	 * @return Room
	 */
	create(attributes = {}) {
		let r = Room.create(attributes);
		this.rooms.push(r);

		return r;
	}

	/**
	 * Remove a room
	 * 
	 * @param  {[type]} code
	 * @return bool
	 */
	destroy(code) {
		let found = false;

		this.rooms = this.rooms.filter(r => {
			if(r.code === code)
				found = true;

			return r.code !== code;
		});

		return found;
	}

	/**
	 * Find a room by code
	 * 
	 * @param  {[type]} code
	 * @return Room
	 */
	findByCode(code) {
		let r = this.rooms.filter(r => {
			return r.code === code;
		});

		if(r.length) {
			return r[0];
		}

		return null;
	}
}