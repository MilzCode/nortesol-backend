const { Router } = require('express');
const { check } = require('express-validator');
const {
	crearCategoria,
	mostrarCategorias,
	buscarCategoria,
} = require('../controllers/categorias.controller');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');
const { tieneRol } = require('../middlewares/validar-roles');

const router = Router();

/*
 TODO: falta hacer validaciones
 - Validar que esten todos los campos obligatorios. ok
 - Validar que solo el administrador pueda crear categorias. 
*/
router.get('/', mostrarCategorias);

router.get(
	'/:id',
	[check('id', 'debe ser un id valido').isMongoId(), validarCampos],
	buscarCategoria
);

router.post(
	'/',
	[
		check('nombre', 'El nombre de la categoria es obligatorio').not().isEmpty(),
		check(
			'descripcion',
			'La descripcion debe tener maximo 200 caracteres'
		).isLength({ max: 200 }),
		check(
			'nombre',
			'El nombre de la categoria debe tener menos de 50 caracteres'
		).isLength({ max: 50 }),
		validarJWT,
		tieneRol('ADMIN'),
		validarCampos,
	],
	crearCategoria
);

module.exports = router;
