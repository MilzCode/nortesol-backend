const { Schema, model } = require('mongoose');

const MarcaSchema = new Schema({
	nombre: {
		type: String,
		required: [true, 'El nombre es requerido'],
		unique: true,
	},
	estado: {
		type: Boolean,
		default: true,
		required: [true, 'El estado es requerido'],
	},
});

MarcaSchema.method('toJSON', function () {
	let { __v, _id, estado, ...object } = this.toObject();
	object.id = _id;
	return object;
});

module.exports = model('Marca', MarcaSchema);
