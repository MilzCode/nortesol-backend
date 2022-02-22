const { borrarImagenCloudinary } = require('../helpers/images-functions');
const Anuncio = require('../models/anuncio');
const { MAXANUNCIOS } = require('../utils/constantes');
const { actualizarImagenAnuncio } = require('./images.controller');
const { nanoid } = require('nanoid');


const mostrarAnuncios = async (req, res) => {
	try {
		const anuncios = await Anuncio.find({});
		return res.json({
			ok: true,
			anuncios,
		});
	} catch (error) {
		return res.status(500).json({
			ok: false,
			msg:
				'Error inesperado al mostrar Anuncios, consulte con el administrador',
		});
	}
};

const crearAnuncio = async (req, res) => {
	try {
		const { nombre, descripcion, url, url_name } = req.body;
		const anuncios = await Anuncio.find({});
		let anunciosCant = anuncios.length;

		if (anunciosCant >= MAXANUNCIOS) {
			return res.status(400).json({
				ok: false,
				msg:
					'Solo se pueden crear ' +
					MAXANUNCIOS +
					' Anuncios, borra el anterior.',
			});
		}
		const aid = nanoid();
		const nuevoAnuncio = new Anuncio({
			nombre: nombre.trim().replace('_', ' '),
			descripcion,
			url,
			url_name,
			aid,
		});
		const anuncio = await nuevoAnuncio.save();
		if (anuncio && !!req.validFiles) {
			const resp = await actualizarImagenAnuncio(req, res, anuncio);
			if (resp.statusCode !== 200) {
				anuncio.remove();
				return resp;
			}
			return resp;
		}

		return res.json({
			ok: true,
			msg: 'Anuncio creado correctamente',
			anuncio,
		});
	} catch (error) {
		console.log(error);
		if (error.code === 11000) {
			return res.status(400).json({
				ok: false,
				msg: 'El anuncio ya existe',
			});
		}
		return res.status(500).json({
			ok: false,
			msg: 'Error inesperado al crear anuncio, consulte con el administrador',
		});
	}
};

const actualizarAnuncio = async (req, res) => {
	try {
		const { idAnuncio } = req.params;
		const { nombre, descripcion, url, url_name } = req.body;
		const anuncio = await Anuncio.findById(idAnuncio);
		if (!anuncio) {
			return res.status(400).json({
				ok: false,
				msg: 'No se encuentra anuncio',
			});
		}
		anuncio.nombre = nombre.trim().replace('_', ' ');
		anuncio.descripcion = descripcion;
		anuncio.url = url;
		anuncio.url_name = url_name;
		const anuncioActualizado = await anuncio.save();
		if (anuncioActualizado && !!req.validFiles) {
			const resp = await actualizarImagenAnuncio(req, res, anuncioActualizado);
			if (resp.statusCode !== 200) {
				anuncio.remove();
				return resp;
			}
			return resp;
		}
		return res.json({
			ok: true,
			msg: 'Anuncio actualizado correctamente',
			anuncioActualizado,
		});
	} catch (error) {
		return res.status(500).json({
			ok: false,
			msg:
				'Error inesperado al actualizar anuncio, consulte con el administrador',
		});
	}
};

const removerAnuncioDefinitivamente = async (req, res) => {
	try {
		const { idAnuncio } = req.params;
		const anuncio = await Anuncio.findById(idAnuncio);
		if (!anuncio) {
			return res.status(400).json({
				ok: false,
				msg: 'No se encuentra anuncio',
			});
		}
		const imagen = anuncio.imagen;
		await anuncio.remove();
		if (imagen) {
			borrarImagenCloudinary(imagen);
		}
		return res.json({
			ok: true,
			msg: 'Anuncio eliminado correctamente',
		});
	} catch (error) {
		return res.status(500).json({
			ok: false,
			msg:
				'Error inesperado al eliminar anuncio, consulte con el administrador',
		});
	}
};

module.exports = {
	mostrarAnuncios,
	crearAnuncio,
	removerAnuncioDefinitivamente,
	actualizarAnuncio,
};
