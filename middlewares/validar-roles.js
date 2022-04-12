const { response } = require('express');

/**
 * tieneRol utiliza antes el middleware validarJWT para funcionar
 *
 */
const tieneRol = (...roles) => {
	return (req, res = response, next) => {
		if (!roles) {
			roles = ['ADMIN'];
		}
		if (!req.usuarioAuth) {
			return res.status(401).json({
				ok: false,
				msg: 'No hay usuario autenticado',
			});
		}
		if (!roles.includes(req.usuarioAuth.rol)) {
			console.log(
				'Alerta! Intento de acceso restringido. ID: ' + req.usuarioAuth._id
			);
			return res.status(401).json({
				ok: false,
				msg: 'No tiene permisos para realizar esta accion.',
			});
		}
		next();
	};
};

module.exports = {
	tieneRol,
};
