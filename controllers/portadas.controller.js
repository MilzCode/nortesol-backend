const { borrarImagenCloudinary } = require('../helpers/images-functions');
const Portada = require('../models/portada');
const { MAXPORTADAS } = require('../utils/constantes');
const { actualizarImagenPortada } = require('./images.controller');

const mostrarPortadas = async (req, res) => {
	try {
		const portadas = await Portada.find({});
		return res.json({
			ok: true,
			portadas,
		});
	} catch (error) {
		return res.status(500).json({
			ok: false,
			msg:
				'Error inesperado al mostrar Portadas, consulte con el administrador',
		});
	}
};

const crearPortada = async (req, res) => {
	try {
		const { nombre, descripcion, url } = req.body;

		const portadas = await Portada.find({}).countDocuments();
		if (portadas >= MAXPORTADAS) {
			return res.status(400).json({
				ok: false,
				msg: 'Solo se pueden crear ' + MAXPORTADAS + ' portadas',
			});
		}

		const nuevaPortada = new Portada({
			nombre,
			descripcion,
			url,
		});
		const portada = await nuevaPortada.save();
		if (portada) {
			const resp = await actualizarImagenPortada(req, res, portada);
			if (resp.statusCode !== 200) {
				portada.remove();
				return resp;
			}
			return resp;
		}

		return res.json({
			ok: true,
			msg: 'Portada creada correctamente',
			portada,
		});
	} catch (error) {
		console.log(error);
		if (error.code === 11000) {
			return res.status(400).json({
				ok: false,
				msg: 'La Portada ya existe',
			});
		}
		return res.status(500).json({
			ok: false,
			msg: 'Error inesperado al crear portada, consulte con el administrador',
		});
	}
};

const removerPortadaDefinitivamente = async (req, res) => {
	try {
		const { idPortada } = req.params;
		const portada = await Portada.findById(idPortada);
		if (!portada) {
			return res.status(400).json({
				ok: false,
				msg: 'No se encuentra portada',
			});
		}
		const imagen = portada.imagen;
		await portada.remove();
		if (imagen) {
			borrarImagenCloudinary(imagen);
		}
		return res.json({
			ok: true,
			msg: 'Portada eliminada correctamente',
		});
	} catch (error) {
		return res.status(500).json({
			ok: false,
			msg:
				'Error inesperado al eliminar portada, consulte con el administrador',
		});
	}
};

module.exports = {
	mostrarPortadas,
	crearPortada,
	removerPortadaDefinitivamente,
};
