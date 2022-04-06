const { Router } = require('express');
const { check } = require('express-validator');
const {
	crearProducto,
	buscarProductos,
	editarProducto,
	quitarYMoverDeColeccion,
	borrarProductoDefinitivamente,
} = require('../controllers/productos_desabilitados.controller');
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

router.get('/', [validarJWT, tieneRol('ADMIN'), validarCampos], (req, res) =>
	buscarProductos(req, res)
);

router.delete(
	'/:id',
	[
		check('id', 'El id del producto es obligatorio').not().isEmpty(),
		validarJWT,
		tieneRol('ADMIN'),
		validarCampos,
	],
	quitarYMoverDeColeccion
);

router.delete(
	'/delete/delete/:id',
	[
		check('id', 'El id del producto es obligatorio').not().isEmpty(),
		validarJWT,
		tieneRol('ADMIN'),
		validarCampos,
	],
	borrarProductoDefinitivamente
);

module.exports = router;
