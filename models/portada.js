const { Schema, model } = require('mongoose');

const PortadaSchema = new Schema({
	nombre: {
		type: String,
	},
	descripcion: {
		type: String,
	},
	imagen: {
		type: String,
	},
	url: {
		type: String,
	},
});

PortadaSchema.method('toJSON', function () {
	let { __v, _id, ...object } = this.toObject();
	object.id = _id;
	return object;
});

module.exports = model('Portada', PortadaSchema);
