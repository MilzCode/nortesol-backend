const Config = require('../models/config');

/**
 * Este metodo retornara la configuracion de un tipo dado, si hay algun error retornarar null
 */
const getConfig = async (type = '') => {
	try {
		if (!type) {
			return null;
		}
		const config = await Config.findOne({ type });
		if (!config) {
			return null;
		}
		return config;
	} catch (error) {
		return null;
	}
};

module.exports = {
	getConfig,
};
