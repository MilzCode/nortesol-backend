const { Router } = require('express');
const {
	insertarProductos,
	habilitarProductos,
	deshabilitarProductos,
} = require('../controllers/multiples.controller');

const router = Router();

router.post('/productos', insertarProductos);
router.post('/productos/habilitar', habilitarProductos);
router.post('/productos/deshabilitar', deshabilitarProductos);

module.exports = router;
