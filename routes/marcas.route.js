const { Router } = require('express');
const { check } = require('express-validator');
const {
	mostrarMarcas,
	crearMarca,
} = require('../controllers/marcas.controller');

const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');
const { tieneRol } = require('../middlewares/validar-roles');

const router = Router();

/*
 TODO: falta hacer validaciones
 - Validar que esten todos los campos obligatorios. ok
 - Validar que solo el administrador pueda crear marcas. 
*/
router.get('/', mostrarMarcas);

router.post(
	'/',
	[
		check('nombre', 'El nombre de la marca es obligatorio').not().isEmpty(),
		validarJWT,
		tieneRol('ADMIN'),
		validarCampos,
	],
	crearMarca
);

module.exports = router;
