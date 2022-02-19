var cloudinary = require('cloudinary').v2;

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_NAME,
	api_key: process.env.CLOUDINARY_KEY,
	api_secret: process.env.CLOUDINARY_SECRET,
});

const path = require('path');
const fs = require('fs');
const { response } = require('express');
const DetalleProducto = require('../models/detalle-producto');
const Producto = require('../models/producto');
const { MAXIMAGENESPORPRODUCTO } = require('../utils/constantes');
const { borrarImagenCloudinary } = require('../helpers/images-functions');

const actualizarImagenProducto = async (req, res = response) => {
	try {
		const { idProducto } = req.params;
		const archivos = req.validFiles;
		if (archivos.length > MAXIMAGENESPORPRODUCTO) {
			return res.status(400).json({
				ok: false,
				msg: `Solo se permiten maximo ${MAXIMAGENESPORPRODUCTO} imagenes`,
			});
		}

		//Validar idProducto que exista y sea valido
		const producto = await Producto.findById(idProducto);
		if (!producto) {
			return res.status(400).json({
				ok: false,
				msg: 'No se encuentra producto',
			});
		}
		const idDetalleProducto = producto.detalle_producto;
		const detalleProducto = await DetalleProducto.findById(idDetalleProducto);
		if (!detalleProducto) {
			console.log('NO SE ENCONTRO DETALLE PRODUCTO!', idDetalleProducto);
			return res.status(400).json({
				ok: false,
				msg: 'No se encuentra detalle del producto',
			});
		}

		//Limpiar imagenes previas si existen
		const imagenesPrevias = detalleProducto.imagenes;
		//no necesitamos que esto sea asincrono.
		imagenesPrevias.forEach((imagen) => {
			borrarImagenCloudinary(imagen);
		});
		const subirCloudinary = archivos.map((archivo) => {
			const tempPathFile = archivo.tempFilePath;
			const respUploadCloudinary = cloudinary.uploader.upload(tempPathFile);
			return respUploadCloudinary;
		});

		const esperarSubir = await Promise.all(subirCloudinary);
		if (!esperarSubir || esperarSubir.length !== archivos.length) {
			return res
				.status(400)
				.json({ ok: false, msg: 'Algunos archivos no pudieron subirse' });
		}

		const imagenesListas = esperarSubir.map(
			(respUploadCloudinary) => respUploadCloudinary.secure_url
		);
		producto.imagen = imagenesListas[0];
		detalleProducto.imagenes = imagenesListas;
		await producto.save();
		await detalleProducto.save();
		return res.json({ ok: true, msg: 'Archivos Subidos' });
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			ok: false,
			msg: 'Error inesperado al subir imagen, contacta al administrador.',
		});
	}
};
////////////////////////////////////////////////////////////////////
const actualizarImagenPortada = async (req, res = response, portada_) => {
	try {
		let { idPortada } = req.params;
		if (!idPortada) {
			if (!portada_) {
				return res.status(400).json({
					ok: false,
					msg: 'No se encuentra portada',
				});
			}
		}
		const archivos = req.validFiles;
		const archivo = archivos[0];

		//Validar idProducto que exista y sea valido
		let portada = null;
		if (portada_) {
			portada = portada_;
		} else {
			portada = await Portada.findById(idPortada);
		}

		if (!portada) {
			return res.status(400).json({
				ok: false,
				msg: 'No se encuentra portada',
			});
		}

		//Limpiar imagenes previas si existen
		const imagenPrevia = portada.imagen;
		//no necesitamos que esto sea asincrono.
		if (imagenPrevia) {
			borrarImagenCloudinary(imagenPrevia);
		}

		const tempPathFile = archivo.tempFilePath;
		const respUploadCloudinary = cloudinary.uploader.upload(tempPathFile);
		const subirCloudinary = await respUploadCloudinary;

		if (!subirCloudinary) {
			return res.status(400).json({
				ok: false,
				msg: 'No se pudo subir la imagen, intente más tarde.',
			});
		}
		const urlImg = subirCloudinary.secure_url;
		portada.imagen = urlImg;
		await portada.save();

		return res.json({ ok: true, msg: 'Archivo Subido' });
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			ok: false,
			msg: 'Error inesperado al subir imagen, contacta al administrador.',
		});
	}
};

module.exports = { actualizarImagenProducto, actualizarImagenPortada };
