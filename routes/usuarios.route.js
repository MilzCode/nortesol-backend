const { Router } = require('express');
const { check } = require('express-validator');
const {
	crearUsuario,
	editarUsuario,
	verDatosUsuario,
} = require('../controllers/usuarios.controller');
const { validarRut } = require('../helpers/validar-rut');
const { emailExiste } = require('../helpers/db-validators');
const { validarCampos } = require('../middlewares/validar-campos');
const { MINCARACTERESCONTRASENA } = require('../utils/constantes');
const { validarJWT } = require('../middlewares/validar-jwt');
const { esMiIdUrl } = require('../middlewares/validar-mi-id');
const router = Router();

/*
  TODO: 
  - Validar que solo el administrador pueda obtener todos los usuarios
/*
 
TODO:
- validar que solo el administrador y el usuario puedan ver los datos del usuario
*/
router.get(
	'/:id?',
	[
		check('id', 'El id es obligatorio').not().isEmpty(),
		check('id', 'No es un id valido').isMongoId(),
		validarCampos,
	],
	verDatosUsuario
);

/*
  TODO:
  - Validar que solo el usuario pueda editar su perfil
*/
router.put(
	'/:id',
	[
		check('id', 'El id es obligatorio').not().isEmpty(),
		check('id', 'No es un id valido').isMongoId(),
		validarJWT,
		esMiIdUrl('id', 'ADMIN'),
		validarCampos,
	],
	editarUsuario
);

/*
- Validar que esten todos los campos obligatorios. ok
- Validar que el rut sea correcto. ok
- Validar que el email sea correcto. ok
- Validar que el email no exista en la base de datos. ok
- Validar que el password sea correcto. ok ?

*/
router.post(
	'/',
	[
		check('nombre', 'El nombre es requerido').not().isEmpty(),
		check('rut', 'El rut es requerido').not().isEmpty(),
		check('rut').custom(validarRut),
		check('email', 'El email es requerido').not().isEmpty(),
		check('email', 'El email no es valido').isEmail(),
		check('email').custom(emailExiste),
		check('celular', 'El celular es requerido').not().isEmpty(),
		check('celular', 'El celular no es valido').isNumeric(),
		check('celular', 'El celular debe tener 9 digitos').isLength({
			min: 9,
			max: 9,
		}),
		check('region', 'La region es requerida').not().isEmpty(),
		check('ciudad', 'La ciudad es requerida').not().isEmpty(),
		check('direccion', 'La direccion es requerida').not().isEmpty(),
		check('password', 'La contraseña es requerida').not().isEmpty(),
		check('password', 'La contraseña debe tener minimo 6 caracteres').isLength({
			min: MINCARACTERESCONTRASENA,
		}),
		validarCampos,
	],
	crearUsuario
);

module.exports = router;
