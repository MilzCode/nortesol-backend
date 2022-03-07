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
} = require('../controllers/multiples.controller');

const router = Router();

router.post('/productos', insertarProductos);
router.post('/productos/habilitar', habilitarProductos);
router.post('/productos/deshabilitar', deshabilitarProductos);
router.delete('/productos/deshabilitados', borrarProductosDes);
router.put('/productos/habilitados', editManyProductos);
router.put('/productos/deshabilitados', editManyProductosDes);
router.put('/marcas', editManyMarcas);
router.put('/categorias', editManyCategorias);
router.delete('/marcas', borrarManyMarcas);
router.delete('/categorias', borrarManyCategorias);
module.exports = router;
