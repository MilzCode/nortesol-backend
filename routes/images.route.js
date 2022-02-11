const { Router } = require('express');
const { check } = require('express-validator');
const {
	actualizarImagenProducto,
} = require('../controllers/images.controller');
const { validarExtensiones } = require('../middlewares/validar-archivo');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');
const { tieneRol } = require('../middlewares/validar-roles');
const router = Router();

/*

	- Solo admin puede almacenar archivos.
	- Verificar JWT
*/
router.put(
	'/:idProducto',
	[
		validarExtensiones('jpg', 'jpeg', 'png', 'gif'),
		validarJWT,
		tieneRol('ADMIN'),
		validarCampos,
	],

	actualizarImagenProducto
);

module.exports = router;
