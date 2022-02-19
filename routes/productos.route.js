const { Router } = require('express');
const { check } = require('express-validator');
const {
	crearProducto,
	mostrarProducto,
	buscarProductoNombre,
	editarProducto,
	buscarProductosFiltros,
} = require('../controllers/productos.controller');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');
const { tieneRol } = require('../middlewares/validar-roles');
const router = Router();

/*
  TODO: falta hacer validaciones
  - Validar que esten todos los campos obligatorios ok.
  - Validar que las categorias sean validas ok.
  - Validar que solo el administrador pueda crear Productos.
  */
router.post(
	'/',
	[
		check('nombre', 'El nombre del producto es obligatorio').not().isEmpty(),
		// //nombre solo alfanumerico
		// check(
		//   "nombre",
		//   "El nombre del producto debe ser alfanumerico"
		// ).isAlphanumeric(),
		//max length
		check(
			'nombre',
			'El nombre del producto debe tener menos de 50 caracteres'
		).isLength({ max: 50 }),
		check('precio', 'El precio del producto es obligatorio').not().isEmpty(),
		check('categorias', 'Las categorias del producto son obligatorias')
			.not()
			.isEmpty(),
		// check("descripcion", "La descripcion del producto es obligatoria").not().isEmpty(),
		// check("relevancia", "La relevancia del producto es obligatoria").not().isEmpty(),
		// check("cantidad", "La cantidad del producto es obligatoria").not().isEmpty(),
		validarJWT,
		tieneRol('ADMIN'),

		validarCampos,
	],
	crearProducto
);
router.put(
	'/:id',
	[
		check('id', 'El id del producto es obligatorio').not().isEmpty(),
		check('id', 'No es un id valido').isMongoId(),
		validarJWT,
		tieneRol('ADMIN'),
		validarCampos,
	],
	editarProducto
);

router.get(
	'/:id',
	[
		check('id', 'El id o nombre_url del producto es obligatorio')
			.not()
			.isEmpty(),
		validarCampos,
	],
	mostrarProducto
);

router.get('/search/productos/', (req, res) =>
	buscarProductosFiltros(req, res)
);

module.exports = router;
