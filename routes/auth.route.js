const { Router } = require('express');
const { check } = require('express-validator');
const { ingresar, validarToken } = require('../controllers/auth.controller');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');

const router = Router();

router.post('/', ingresar);
router.get('/', [validarJWT, validarCampos], validarToken);

module.exports = router;
