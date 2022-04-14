const Usuario = require('../models/usuario');
const bcryptjs = require('bcryptjs');
const { generarJWT } = require('../helpers/generar-jwt');

const ingresar = async (req, res) => {
	try {
		const { email, password } = req.body;

		const usuarioDB = await Usuario.findOne({ email });
		if (!usuarioDB) {
			return res.status(400).json({
				ok: false,
				msg: 'El usuario o password son incorrectos',
			});
		}

		// SOLO ADMIN
		if (usuarioDB.rol !== 'ADMIN') {
			console.log(
				'Alerta! Intento de ingreso de usuario no autorizado, usuario: ' +
					usuarioDB.email
			);
			return res.status(400).json({
				ok: false,
				msg: 'El usuario no tiene permisos para ingresar',
			});
		}

		const validPassword = bcryptjs.compareSync(password, usuarioDB.password);
		if (!validPassword) {
			return res.status(400).json({
				ok: false,
				msg: 'El usuario o password son incorrectos - password',
			});
		}
		const token = await generarJWT(usuarioDB._id);

		res.json({
			ok: true,
			usuarioDB,
			token,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			ok: false,
			msg:
				'Error inesperado al intentar ingresar, consulte con el administrador',
		});
	}
};
const ingresarFirebase = async (req, res) => {
	try {
		const { email, name, typeLogin } = req.usuarioData;
		let usuarioDB = await Usuario.findOne({ email });
		let newUser = false;
		if (!usuarioDB) {
			newUser = true;
			const google = typeLogin === 'google';
			const facebook = typeLogin === 'facebook';
			usuarioDB = new Usuario({
				email,
				email_original: email,
				tienepassword: false,
				password: 'a',
				google,
				facebook,
				rut: '00.000.000-0',
				rut_original: '//',
				nombre: name ? name : 'Sin nombre',
				celular: '912345678',
				region: 'region',
				ciudad: 'ciudad',
				direccion: 'direccion',
				emailVerificado: true,
			});
			usuarioDB = await usuarioDB.save();
			newUser = true;
		}
		//DISABLED LOGIN TYPE FACEBOOK FOR ADMINS
		if (usuarioDB.rol === 'ADMIN' && typeLogin === 'facebook') {
			return res.status(400).json({
				ok: false,
				msg: 'El usuario no tiene permisos para ingresar',
			});
		}

		const token = await generarJWT(usuarioDB._id);

		res.json({
			ok: true,
			usuarioDB,
			token,
			newUser,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			ok: false,
			msg:
				'Error inesperado al intentar ingresar, consulte con el administrador',
		});
	}
};

const validarToken = (req, res, next) => {
	//si llega a este punto deberia estar todo validado
	return res.json({
		ok: true,
	});
};

module.exports = { ingresar, validarToken, ingresarFirebase };
