const { default: axios } = require('axios');
const googleVerify = require('../helpers/google-verify');
const GetAccessTokenFacebook = require('../helpers/access-token-facebook');

const validarTokenGoogle = async (req, res = response, next) => {
	try {
		const token = req.header('g-token');
		if (!token) {
			return res.status(401).json({
				ok: false,
				msg: 'No hay token en la peticion',
			});
		}
		const data = await googleVerify(token);
		if (!data) {
			return res.status(401).json({
				ok: false,
				msg: 'Token no valido',
			});
		}
		req.usuarioData = { ...data, typeLogin: 'google' };
		next();
	} catch (error) {
		return res.status(401).json({
			ok: false,
			msg: 'Token no valido',
		});
	}
};

const validarTokenFacebook = async (req, res = response, next) => {
	try {
		const token = req.header('f-token');
		if (!token) {
			return res.status(401).json({
				ok: false,
				msg: 'No hay token en la peticion',
			});
		}

		const tokenFacebook = await GetAccessTokenFacebook();
		const url = 'https://graph.facebook.com/debug_token';
		const params = {
			input_token: token,
			access_token: tokenFacebook,
		};
		const response = await axios.get(url, { params });
		const data = response.data.data;
		if (!data.scopes.includes('email')) {
			return res.status(401).json({
				ok: false,
				msg: 'No tiene permisos de email',
			});
		}
		//now get the user data
		const urlUser = `https://graph.facebook.com/${data.user_id}`;
		const paramsUser = {
			// fields: 'id,name,email,picture',
			fields: 'id,email,name',
			access_token: token,
		};
		const responseUser = await axios.get(urlUser, { params: paramsUser });
		const dataUser = responseUser.data;
		req.usuarioData = { ...dataUser, typeLogin: 'facebook' };

		next();
	} catch (error) {
		console.log({ error });
		return res.status(401).json({
			ok: false,
			msg: 'Token no valido',
		});
	}
};
/**
 * Esta funcion se encarga de validar el token de google o facebook segun sea el caso
 */
const validarTokenAny = async (req, res = response, next) => {
	try {
		const tokenFacebook = req.header('f-token');
		const tokenGoogle = req.header('g-token');
		if (!tokenFacebook && !tokenGoogle) {
			return res.status(401).json({
				ok: false,
				msg: 'No hay token en la peticion',
			});
		}
		if (tokenFacebook) {
			return validarTokenFacebook(req, res, next);
		} else if (tokenGoogle) {
			return validarTokenGoogle(req, res, next);
		}
	} catch (error) {
		return res.status(401).json({
			ok: false,
			msg: 'Token no valido',
		});
	}
};

module.exports = {
	validarTokenGoogle,
	validarTokenFacebook,
	validarTokenAny,
};
