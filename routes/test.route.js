const { Router } = require('express');
const { check } = require('express-validator');
const {
	actualizarImagenProducto,
} = require('../controllers/images.controller');
const { validarExtensiones } = require('../middlewares/validar-archivo');
const { validarCampos } = require('../middlewares/validar-campos');
const {
	validarFirebaseToken,
} = require('../middlewares/validar-firebase-token');
const { validarJWT } = require('../middlewares/validar-jwt');
const { tieneRol } = require('../middlewares/validar-roles');
const buscarCategoriasValidas = require('../utils/buscar-categorias-validas');
const router = Router();

router.get(
	'/',
	[validarFirebaseToken, validarCampos],

	(req, res) => {
		return res.json({ msg: 'weeena' });
	}
);

module.exports = router;
