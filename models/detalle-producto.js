const { Schema, model } = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const {
	MAXIMAGENESPORPRODUCTO,
	MAXCATEGORIASPORPRODUCTO,
} = require('../utils/constantes');

const DetalleProductoSchema = new Schema({
	descripcion: {
		type: String,
		default: '',
	},
	imagenes: {
		type: [String],
		validate: function (value) {
			return value.length <= MAXIMAGENESPORPRODUCTO;
		},
	},
});

DetalleProductoSchema.method('toJSON', function () {
	let { __v, _id, ...object } = this.toObject();
	object.id = _id;
	return object;
});

DetalleProductoSchema.plugin(mongoosePaginate);

module.exports = model('DetalleProducto', DetalleProductoSchema);
