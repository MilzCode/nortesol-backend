const { Schema, model } = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const PedidoSchema = new Schema({
	usuario: {
		type: Schema.Types.ObjectId,
		ref: 'Usuario',
		default: null,
	},
	usuario_email: {
		type: String,
		ref: 'string',
		required: [true, 'El email del usuario es requerido'],
	},
	usuario_email_cuenta_mp: {
		type: String,
		ref: 'string',
		default: '',
	},
	usuario_nombre: {
		type: String,
		ref: 'string',
	},
	usuario_celular: {
		type: String,
		ref: 'string',
	},
	usuario_rut: {
		type: String,
		ref: 'string',
	},
	id_pay: {
		type: String,
		required: [true, 'El id del pago es requerido'],
	},
	date_mp: {
		type: Date,
		default: Date.now,
	},
	date: {
		type: Date,
		default: Date.now,
	},
	recibido: {
		type: Boolean,
		default: false,
	},
	status: {
		type: String,
		default: 'nodata',
	},
	domicilio: {
		type: Boolean,
		default: false,
	},
	cancelado: {
		type: Boolean,
		default: false,
	},

	ubicacion: {
		type: {
			region: { type: String, required: [true, 'La region es requerida'] },
			ciudad: { type: String, required: [true, 'La ciudad es requerida'] },
			direccion: {
				type: String,
				required: [true, 'La ubicacion es requerida'],
			},
		},
		default: {
			region: '',
			ciudad: '',
			direccion: '',
		},
	},

	items: {
		type: [
			{
				quantity: {
					type: Number,
					default: 0,
					required: [true, 'La cantidad es requerida'],
				},
				pid: {
					type: String,
					ref: 'Producto',
					required: [true, 'El producto es requerido'],
				},
				unit_price: {
					type: Number,
					default: 99999999,
					required: [true, 'El total es requerido'],
				},
				title: {
					type: String,
					required: [true, 'El nombre es requerido'],
				},
				total_this: {
					type: Number,
					default: 99999999,
					required: [true, 'El total es requerido'],
				},
			},
		],
		required: [true, 'Los productos son requeridos'],
		default: [],
	},
	total: {
		type: Number,
		default: 99999999,
		required: [true, 'El total es requerido'],
	},
});

PedidoSchema.method('toJSON', function () {
	let { __v, _id, ...object } = this.toObject();
	object.id = _id;
	return object;
});
PedidoSchema.plugin(mongoosePaginate);

module.exports = model('Pedido', PedidoSchema);
