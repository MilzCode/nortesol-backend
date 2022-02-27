const { Router } = require('express');
const { check } = require('express-validator');
const { verHistorial } = require('../controllers/historial.controller');

const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');
const { tieneRol } = require('../middlewares/validar-roles');
const router = Router();

/*
 TODO: falta hacer validaciones
 - Validar que esten todos los campos obligatorios. ok
 - Validar que solo el administrador pueda crear marcas. 
*/
router.get('/', [validarJWT, tieneRol('ADMIN'), validarCampos], verHistorial);

module.exports = router;
