const { Router } = require('express');
const { check } = require('express-validator');
const {
	mostrarAnuncios,
	removerAnuncioDefinitivamente,
	crearAnuncio,
	actualizarAnuncio,
} = require('../controllers/anuncios.controller');

const { validarExtensiones } = require('../middlewares/validar-archivo');

const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');
const { tieneRol } = require('../middlewares/validar-roles');
const router = Router();

/*
 TODO: falta hacer validaciones
 - Validar que esten todos los campos obligatorios. ok
 - Validar que solo el administrador pueda crear marcas. 
*/
router.get('/', mostrarAnuncios);

router.post(
	'/',
	[
		// check('nombre', 'El nombre de la marca es obligatorio').not().isEmpty(),
		validarJWT,
		tieneRol('ADMIN'),
		validarExtensiones({ valid: ['jpg', 'jpeg', 'png', 'gif'], skip: true }),
		validarCampos,
	],
	crearAnuncio
);

router.put(
	'/:idAnuncio',
	[
		validarJWT,
		tieneRol('ADMIN'),
		validarExtensiones({ valid: ['jpg', 'jpeg', 'png', 'gif'], skip: true }),
		validarCampos,
	],
	actualizarAnuncio
);

router.delete(
	'/:idAnuncio',
	[
		check('idAnuncio', 'El id es obligatorio').not().isEmpty(),
		validarJWT,
		tieneRol('ADMIN'),
		validarCampos,
	],
	removerAnuncioDefinitivamente
);

module.exports = router;
