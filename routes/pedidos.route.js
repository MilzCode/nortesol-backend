const { Router } = require('express');
const { check } = require('express-validator');
const {
	crearPedido,
	buscarPedido,
	pedidosUsuarioId,
} = require('../controllers/pedidos.controller');
const { usuarioExiste } = require('../helpers/db-validators');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');
const { estMiIdBody, esMiIdUrl } = require('../middlewares/validar-mi-id');
const router = Router();

// router.get("/", (req, res) => {
//   console.log("hola");
//   res.json({ msg: "hola" });
// });

/*
TODO:
- esta ruta solo puede acceder el administrador
*/
router.get('/:idoemail?', buscarPedido);

router.get(
	'/mis-pedidos/:idUsuario',
	[
		validarJWT,
		check(
			'idUsuario',
			'El id del usuario debe ser un ObjectId valido'
		).isMongoId(),
		esMiIdUrl('idUsuario', 'ADMIN'), //solo el usuario y el administrador pueden acceder a esta ruta
		validarCampos,
	],
	pedidosUsuarioId
);
/* 
    TODO: Almacenar datos en mayusculas
    - Validar que los campos obligatorios esten presentes

*/

module.exports = router;
