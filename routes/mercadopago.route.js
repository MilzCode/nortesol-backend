const { Router } = require('express');
const { nuevoPago } = require('../controllers/mercadopago.controller');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');
const router = Router();

router.post('/', [validarJWT, validarCampos], nuevoPago);

module.exports = router;
