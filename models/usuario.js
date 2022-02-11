const { Schema, model } = require('mongoose');
const { ROLES } = require('../utils/constantes');

/*

  nombre: "",
  rut: "",
  email: "",
  celular: "",
  region: "",
  ciudad: "",
  direccion: "",
  password: "",
  password2: "",
*/

const UsuarioSchema = new Schema({
	nombre: {
		type: String,
		required: [true, 'El nombre es necesario'],
	},
	rut: {
		type: String,
		required: [true, 'El rut es necesario'],
	},
	rut_original: {
		type: String,
		required: [true, 'El rut original es necesario'],
	},
	email: {
		type: String,
		required: [true, 'El correo es necesario'],
		unique: true,
	},
	email_original: {
		type: String,
		required: [true, 'El correo original es necesario'],
	},
	celular: {
		type: String,
		required: [true, 'El celular es necesario'],
	},
	region: {
		type: String,
		required: [true, 'La region es necesaria'],
	},
	ciudad: {
		type: String,
		required: [true, 'La ciudad es necesaria'],
	},
	direccion: {
		type: String,
		required: [true, 'La direccion es necesaria'],
	},
	password: {
		type: String,
		required: [true, 'La contraseña es necesaria'],
	},
	img: {
		type: String,
	},
	rol: {
		type: String,
		enum: ROLES, //validar que el rol sea uno de los indicados
		default: 'USER',
	},
	estado: {
		type: Boolean,
		default: true,
	},
	google: {
		type: Boolean,
		default: false,
	},
	fechaCreacion: {
		type: Date,
		default: Date.now,
	},
	emailVerificado: {
		type: Boolean,
		default: false,
	},
	pedidos: {
		type: [
			{
				type: Schema.Types.ObjectId,
				ref: 'Pedido',
			},
		],
		default: [],
	},
});
//Acontinuacion se define el metodo toJSON para que no se muestre el password (y version) en la respuesta (en cualquier lugar que se haga una consulta aca se establecera su respuesta)
UsuarioSchema.methods.toJSON = function () {
	const {
		__v,
		password,
		_id,
		email_original,
		rol,
		fechaCreacion,
		...usuario
	} = this.toObject();
	return { ...usuario, uid: _id };
};

module.exports = model('Usuario', UsuarioSchema);
