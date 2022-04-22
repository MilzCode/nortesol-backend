const { Router } = require('express');
const { check } = require('express-validator');
const {
	editarUsuario,
	editarUsuarioYPass,
	buscarUsuarios,
	verDatosUsuario,
} = require('../controllers/usuarios.controller');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');
const { esMiIdUrl } = require('../middlewares/validar-mi-id');
const { tieneRol } = require('../middlewares/validar-roles');
const router = Router();

router.get('/all', [validarJWT, tieneRol('ADMIN')], buscarUsuarios);

router.put(
	'/:id',
	[
		check('id', 'El id es obligatorio').not().isEmpty(),
		check('id', 'No es un id valido').isMongoId(),
		check('nombre', 'El nombre no puede tenes más de 100 caracteres').isLength({
			max: 100,
		}),
		check('rut', 'El rut no puede tener más de 12 caracteres').isLength({
			max: 12,
		}),
		check('celular', 'El celular no puede tener más de 12 caracteres').isLength(
			{
				max: 12,
			}
		),
		check('region', 'La region no puede tener más de 100 caracteres').isLength({
			max: 100,
		}),
		check('ciudad', 'La ciudad no puede tener más de 100 caracteres').isLength({
			max: 100,
		}),
		check(
			'direccion',
			'La direccion no puede tener más de 100 caracteres'
		).isLength({
			max: 200,
		}),

		validarJWT,
		// esMiIdUrl('id', 'ADMIN'),
		esMiIdUrl('id'),
		validarCampos,
	],
	editarUsuario
);

router.get(
	'/:id?',
	[
		check('id', 'El id es obligatorio').not().isEmpty(),
		check('id', 'No es un id valido').isMongoId(),
		validarJWT,
		esMiIdUrl('id'),
		validarCampos,
	],
	verDatosUsuario
);

router.put(
	'/withpass/:id',
	[
		check('id', 'El id es obligatorio').not().isEmpty(),
		check('id', 'No es un id valido').isMongoId(),
		validarJWT,
		// esMiIdUrl('id', 'ADMIN'),
		esMiIdUrl('id'),
		tieneRol('ADMIN'),
		validarCampos,
	],
	editarUsuarioYPass
);

/*
- Validar que esten todos los campos obligatorios. ok
- Validar que el rut sea correcto. ok
- Validar que el email sea correcto. ok
- Validar que el email no exista en la base de datos. ok
- Validar que el password sea correcto. ok ?

*/
// router.post(
// 	'/',
// 	[
// 		check('nombre', 'El nombre es requerido').not().isEmpty(),
// 		check('rut', 'El rut es requerido').not().isEmpty(),
// 		check('rut').custom(validarRut),
// 		check('email', 'El email es requerido').not().isEmpty(),
// 		check('email', 'El email no es valido').isEmail(),
// 		check('email').custom(emailExiste),
// 		check('celular', 'El celular es requerido').not().isEmpty(),
// 		check('celular', 'El celular no es valido').isNumeric(),
// 		check('celular', 'El celular debe tener 9 digitos').isLength({
// 			min: 9,
// 			max: 9,
// 		}),
// 		check('region', 'La region es requerida').not().isEmpty(),
// 		check('ciudad', 'La ciudad es requerida').not().isEmpty(),
// 		check('direccion', 'La direccion es requerida').not().isEmpty(),
// 		check('password', 'La contraseña es requerida').not().isEmpty(),
// 		check('password', 'La contraseña debe tener minimo 6 caracteres').isLength({
// 			min: MINCARACTERESCONTRASENA,
// 		}),
// 		validarJWT,
// 		tieneRol('ADMIN'),
// 		validarCampos,
// 	],
// 	crearUsuario
// );

module.exports = router;
