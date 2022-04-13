const { Schema, model } = require('mongoose');

const Config = new Schema({
	type: {
		type: String,
		required: [true, 'El tipo es requerido'],
		unique: true,
	},
	status: {
		type: Boolean,
		default: false,
	},
});

Config.method('toJSON', function () {
	let { __v, _id, ...object } = this.toObject();
	object.id = _id;
	return object;
});

module.exports = model('Config', Config);
