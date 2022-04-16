const { Router } = require('express');
const { check } = require('express-validator');
const {
	buscarPedido,
	pedidosUsuarioId,
	entregarPedido,
} = require('../controllers/pedidos.controller');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');
const { esMiIdUrl } = require('../middlewares/validar-mi-id');
const { tieneRol } = require('../middlewares/validar-roles');
const router = Router();

/*
TODO:
- esta ruta solo puede acceder el administrador
*/
router.get(
	'/all',
	[validarJWT, tieneRol('ADMIN'), validarCampos],
	buscarPedido
);
router.put(
	'/:idpedido',
	[validarJWT, tieneRol('ADMIN'), validarCampos],
	entregarPedido
);

router.get(
	'/mis-pedidos/:idUsuario',
	[
		validarJWT,
		check(
			'idUsuario',
			'El id del usuario debe ser un ObjectId valido'
		).isMongoId(),
		esMiIdUrl('idUsuario', 'ADMIN'), //solo el usuario y el administrador pueden acceder a esta ruta
		validarCampos,
	],
	pedidosUsuarioId
);

module.exports = router;
