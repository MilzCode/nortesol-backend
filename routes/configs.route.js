const { Router } = require('express');
const { getConfigs, setConfig } = require('../controllers/configs.controller');

const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');
const { tieneRol } = require('../middlewares/validar-roles');
const router = Router();

router.get('/', [validarJWT, tieneRol('ADMIN'), validarCampos], getConfigs);
router.put('/', [validarJWT, tieneRol('ADMIN'), validarCampos], setConfig);

module.exports = router;
