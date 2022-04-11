const { Router } = require('express');
const {
	nuevoPago,
	webhookPagoCreado,
} = require('../controllers/mercadopago.controller');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');
const router = Router();

router.post('/', [validarJWT, validarCampos], nuevoPago);
router.post('/webhook', [], webhookPagoCreado);

module.exports = router;
