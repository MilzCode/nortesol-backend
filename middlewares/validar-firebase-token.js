const { default: axios } = require('axios');
const { response } = require('express');
const GetAccessTokenFacebook = require('../utils/access-token-facebook');
const { OAuth2Client } = require('google-auth-library');
const Firebase = require('../Firebase');

const validarFirebaseToken = async (req, res = response, next) => {
	const tipo = req.header('x-tipo');
	if (!tipo) {
		return res.status(401).json({
			ok: false,
			msg: 'No hay tipo de token en la peticion',
		});
	}
	const token = req.header('x-token');
	if (!token) {
		return res.status(401).json({
			ok: false,
			msg: 'No hay token en la peticion',
		});
	}
	if (tipo === 'facebook') {
		console.log('tipo: facebook');
		const tokenFacebook = await GetAccessTokenFacebook();
		if (tokenFacebook) {
			console.log('tokenFacebook: ', tokenFacebook);

			const url = 'https://graph.facebook.com/debug_token';
			const params = {
				input_token: token,
				access_token: tokenFacebook,
			};
			const response = await axios.get(url, { params });
			if (response.data.data.is_valid) {
				next();
			}
		}
	}
	if (tipo === 'google') {
		console.log('tipo: google');
		try {
			const decodeValue = await Firebase.auth().verifyIdToken(token);
			console.log('decodeValue: ', decodeValue);
		} catch (error) {
			console.log(error);
		}
	}
	return res.status(401).json({
		ok: false,
		msg: 'Token no valido FBK',
	});
};

module.exports = { validarFirebaseToken };
