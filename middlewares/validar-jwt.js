const { response } = require('express');
const jwt = require('jsonwebtoken');
const usuario = require('../models/usuario');

/*
  Validar JWT carga en la req al usuario como usuarioAuth y valida el oken
*/
const validarJWT = async (req, res = response, next) => {
	const token = req.header('x-token');
	if (!token) {
		return res.status(401).json({
			ok: false,
			msg: 'No hay token en la peticion',
		});
	}
	try {
		const data = jwt.verify(token, process.env.JWT_SECRET);
		const uid = data.check;
		req.uid = uid;
		const usuarioAuth = await usuario.findById(uid);
		if (!usuarioAuth) {
			return res.status(401).json({
				ok: false,
				msg: 'Usuario no encontrado (no existe)',
			});
		}
		// if (usuarioAuth.estado === false) {
		//   return res.status(401).json({
		//     ok: false,
		//     msg: "Usuario no encontrado (estado false)",
		//   });
		// }
		req.usuarioAuth = usuarioAuth;
	} catch (error) {
		if (error.name === 'TokenExpiredError') {
			return res.status(401).json({
				ok: false,
				msg: 'Token expirado',
			});
		}
		if (error.name === 'JsonWebTokenError') {
			return res.status(400).json({
				ok: false,
				msg: 'Token no valido',
			});
		}
		console.log(error);
		return res.status(500).json({
			ok: false,
			msg: 'Error validando token',
		});
	}
	next();
};

module.exports = { validarJWT };
