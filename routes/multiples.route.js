const { Router } = require('express');
const {
	insertarProductos,
	habilitarProductos,
	deshabilitarProductos,
	borrarProductosDes,
	editManyProductos,
	editManyProductosDes,
	editManyMarcas,
	editManyCategorias,
	borrarManyMarcas,
	borrarManyCategorias,
	insertarMarcas,
	insertarCategorias,
} = require('../controllers/multiples.controller');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');
const { tieneRol } = require('../middlewares/validar-roles');

const router = Router();

router.post(
	'/productos',
	[validarJWT, tieneRol('ADMIN'), validarCampos],
	insertarProductos
);
router.post(
	'/productos/habilitar',
	[validarJWT, tieneRol('ADMIN'), validarCampos],
	habilitarProductos
);
router.post(
	'/productos/deshabilitar',
	[validarJWT, tieneRol('ADMIN'), validarCampos],
	deshabilitarProductos
);
router.delete(
	'/productos/deshabilitados',
	[validarJWT, tieneRol('ADMIN'), validarCampos],
	borrarProductosDes
);
router.put(
	'/productos/habilitados',
	[validarJWT, tieneRol('ADMIN'), validarCampos],
	editManyProductos
);
router.put(
	'/productos/deshabilitados',
	[validarJWT, tieneRol('ADMIN'), validarCampos],
	editManyProductosDes
);
router.put(
	'/marcas',
	[validarJWT, tieneRol('ADMIN'), validarCampos],
	editManyMarcas
);
router.put(
	'/categorias',
	[validarJWT, tieneRol('ADMIN'), validarCampos],
	editManyCategorias
);
router.delete(
	'/marcas',
	[validarJWT, tieneRol('ADMIN'), validarCampos],
	borrarManyMarcas
);
router.delete(
	'/categorias',
	[validarJWT, tieneRol('ADMIN'), validarCampos],
	borrarManyCategorias
);
router.post(
	'/marcas',
	[validarJWT, tieneRol('ADMIN'), validarCampos],
	insertarMarcas
);
router.post(
	'/categorias',
	[validarJWT, tieneRol('ADMIN'), validarCampos],
	insertarCategorias
);
module.exports = router;
