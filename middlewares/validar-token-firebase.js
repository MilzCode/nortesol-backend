const jwt = require('jsonwebtoken');
const axios = require('axios');

const verifyTokenFirebase = async (token) => {
	try {
		const decoded = jwt.decode(token, { complete: true });
		const kid = decoded.header.kid;
		const alg = decoded.header.alg;
		const urlCertiificate =
			'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';

		const res = await axios.get(urlCertiificate);
		let certificate = res.data[kid];

		return {
			ok: true,
			data: jwt.verify(token, certificate, { algorithms: [alg] }),
		};
	} catch (error) {
		return { ok: false, error };
	}
};

const validarTokenFirebase = async (req, res = response, next) => {
	const token = req.header('fb-token');
	if (!token) {
		return res.status(401).json({
			ok: false,
			msg: 'No hay token en la peticion',
		});
	}
	const data = await verifyTokenFirebase(token);
	if (!data.ok) {
		return res.status(401).json({
			ok: false,
			msg: 'Token no valido',
		});
	}
	req.usuarioData = data.data;
	next();
};

module.exports = { validarTokenFirebase };
