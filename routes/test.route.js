const { Router } = require('express');
const { v4: uuidv4 } = require('uuid');
const { check } = require('express-validator');
const {
	actualizarImagenProducto,
} = require('../controllers/images.controller');
const { validarExtensiones } = require('../middlewares/validar-archivo');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');
const { tieneRol } = require('../middlewares/validar-roles');
const buscarCategoriasValidas = require('../utils/buscar-categorias-validas');
const router = Router();

router.get(
	'/',

	(req, res) => {
		console.log(uuidv4());
		return res.json({ msg: 'weeena' });
	}
);

module.exports = router;
