const { Router } = require('express');
const { check } = require('express-validator');
const {
	ingresar,
	validarToken,
	ingresarFirebase,
} = require('../controllers/auth.controller');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');
const {
	validarTokenFirebase,
} = require('../middlewares/validar-token-firebase');

const router = Router();

router.post('/', ingresar);
router.post(
	'/firebase',
	[validarTokenFirebase, validarCampos],
	ingresarFirebase
);
// router.get('/', [validarJWT, validarCampos], validarToken);
router.get('/', [validarJWT, validarCampos], validarToken);

module.exports = router;
