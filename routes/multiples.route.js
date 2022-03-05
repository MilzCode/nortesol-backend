const { Router } = require('express');
const {
	insertarProductos,
	habilitarProductos,
	deshabilitarProductos,
	borrarProductosDes,
	editManyProductos,
	editManyProductosDes,
} = require('../controllers/multiples.controller');

const router = Router();

router.post('/productos', insertarProductos);
router.post('/productos/habilitar', habilitarProductos);
router.post('/productos/deshabilitar', deshabilitarProductos);
router.delete('/productos/deshabilitados', borrarProductosDes);
router.put('/productos/habilitados', editManyProductos);
router.put('/productos/deshabilitados', editManyProductosDes);

module.exports = router;
