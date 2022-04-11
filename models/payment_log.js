const { Schema, model } = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const PaymentLogSchema = new Schema({
	date: {
		type: Date,
		default: Date.now,
	},
	date_mp: {
		type: Date,
		default: Date.now,
	},
	usuario_email: {
		type: String,
		ref: 'string',
		required: [true, 'El email del usuario es requerido'],
		description:
			'El email del usuario que realizó el pago para pagar desde el sistema',
	},
	usuario_email_cuenta_mp: {
		type: String,
		ref: 'string',
		default: '',
		description: 'El email que utilizo el usuario para pagar con MercadoPago',
	},
	id_pay: {
		type: String,
		required: [true, 'El id del pago es requerido'],
	},
});

PaymentLogSchema.method('toJSON', function () {
	let { __v, _id, ...object } = this.toObject();
	object.id = _id;
	return object;
});

PaymentLogSchema.plugin(mongoosePaginate);

module.exports = model('PaymentLog', PaymentLogSchema);
