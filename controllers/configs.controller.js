const Config = require('../models/config');

const setConfig = async (req, res) => {
	try {
		const { type, status } = req.body;
		if (!type || status === undefined) {
			return res.status(400).json({
				ok: false,
				msg: 'El type y status es requerido',
			});
		}
		const config = await Config.findOne({ type });
		if (config) {
			config.status = status;
			await config.save();
		} else {
			return res.status(400).json({
				ok: false,
				msg: 'No se encontró el tipo de configuración',
			});
		}
		return res.json({
			ok: true,
			msg: 'Configuración actualizada correctamente',
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			ok: false,
			msg: 'Error inesperado al actualizar configuración',
		});
	}
};

const getConfigs = async (req, res) => {
	console.log('acaget');
	try {
		const configs = await Config.find();
		return res.json({
			ok: true,
			configs,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			ok: false,
			msg: 'Error inesperado al obtener configuraciones',
		});
	}
};

module.exports = {
	setConfig,
	getConfigs,
};
