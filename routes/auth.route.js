const { Router } = require('express');
const { check } = require('express-validator');
const {
	ingresar,
	validarToken,
	failLogin,
	loginRRSS,
} = require('../controllers/auth.controller');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');
const passport = require('passport');

const router = Router();

router.post('/', ingresar);
router.get('/', [validarJWT, validarCampos], validarToken);
router.get('/fail', failLogin);
router.get('/logout', (req, res) => {
	req.session = null;
	req.logout();
	res.redirect('/');
});

// Google login
router.get(
	'/google',
	passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
	'/facebook',
	passport.authenticate('facebook', { scope: ['email'] })
);

router.get(
	'/google/callback',
	passport.authenticate('google', {
		failureRedirect: '/api/auth/fail',
	}),
	loginRRSS
);

router.get(
	'/facebook/callback',
	passport.authenticate('facebook', {
		failureRedirect: '/api/auth/fail',
	}),
	loginRRSS
);

module.exports = router;
