const { Router } = require('express');
const { check } = require('express-validator');
const { ingresar, validarToken } = require('../controllers/auth.controller');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');
const passport = require('passport');

const router = Router();

router.post('/', ingresar);
router.get('/', [validarJWT, validarCampos], validarToken);
//test pasport

// Example protected and unprotected routes
router.get('/', (req, res) => res.send('Example Home page!'));
router.get('/failed', (req, res) => res.send('You Failed to log in!'));

// In this route you can see that if the user is logged in u can acess his info in: req.user
router.get('/good', (req, res) =>
	res.send(`Welcome mr ${req.user.displayName}!`)
);

// Auth Routes
router.get(
	'/google',
	passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
	'/google/callback',
	passport.authenticate('google', { failureRedirect: '/failed' }),
	function (req, res) {
		// Successful authentication, redirect home.
		console.log("okok");
		res.redirect('/good');
	}
);

router.get('/logout', (req, res) => {
	req.session = null;
	req.logout();
	res.redirect('/');
});

module.exports = router;
