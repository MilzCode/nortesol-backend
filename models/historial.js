const { Schema, model } = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const HistorialSchema = new Schema({
	fecha: {
		type: Date,
		default: Date.now,
	},
	usuario: {
		type: Schema.Types.ObjectId,
		ref: 'Usuario',
		required: [true, 'El usuario es requerido'],
	},
	usuario_name: {
		type: String,
		required: [true, 'El nombre del usuario es requerido'],
	},
	tipo: {
		type: String,
		default: '¿desconocido?',
		required: [true, 'El tipo es requerido'],
	},
	detalle: {
		type: String,
		default: 'sin detalle',
	},
});

HistorialSchema.method('toJSON', function () {
	let { __v, _id, ...object } = this.toObject();
	object.id = _id;
	return object;
});

HistorialSchema.plugin(mongoosePaginate);

module.exports = model('Historial', HistorialSchema);
