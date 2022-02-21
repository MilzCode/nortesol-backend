const { Schema, model } = require('mongoose');

const AnuncioSchema = new Schema({
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
	url_name: {
		type: String,
	},
	aid: {
		type: String,
	},
});

AnuncioSchema.method('toJSON', function () {
	let { __v, _id, ...object } = this.toObject();
	object.id = _id;
	return object;
});

module.exports = model('Anuncio', AnuncioSchema);
