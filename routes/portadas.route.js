const { Router } = require('express');
const { check } = require('express-validator');
const {
	mostrarPortadas,
	crearPortada,
	removerPortadaDefinitivamente,
} = require('../controllers/portadas.controller');
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
router.get('/', mostrarPortadas);

router.post(
	'/',
	[
		// check('nombre', 'El nombre de la marca es obligatorio').not().isEmpty(),
		validarJWT,
		tieneRol('ADMIN'),
		validarExtensiones('jpg', 'jpeg', 'png', 'gif'),
		validarCampos,
	],
	crearPortada
);

router.delete(
	'/:idPortada',
	[
		check('idPortada', 'El id es obligatorio').not().isEmpty(),
		validarJWT,
		tieneRol('ADMIN'),
		validarCampos,
	],
	removerPortadaDefinitivamente
);

module.exports = router;
