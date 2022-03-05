const { Router } = require('express');
const {
	insertarProductos,
	habilitarProductos,
	deshabilitarProductos,
	borrarProductosDes,
} = require('../controllers/multiples.controller');

const router = Router();

router.post('/productos', insertarProductos);
router.post('/productos/habilitar', habilitarProductos);
router.post('/productos/deshabilitar', deshabilitarProductos);
router.delete('/productos/deshabilitados', borrarProductosDes);

module.exports = router;
