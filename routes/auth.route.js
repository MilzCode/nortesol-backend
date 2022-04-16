const { Router } = require('express');
const {
	ingresar,
	validarToken,
	ingresarFirebase,
} = require('../controllers/auth.controller');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');

const {
	validarTokenGoogle,
	validarTokenFacebook,
} = require('../middlewares/validar-tokens');

const router = Router();

router.get('/', [validarJWT, validarCampos], validarToken);
router.post('/', ingresar);
router.post('/google', [validarTokenGoogle], ingresarFirebase);
router.post('/facebook', [validarTokenFacebook], ingresarFirebase);

module.exports = router;
