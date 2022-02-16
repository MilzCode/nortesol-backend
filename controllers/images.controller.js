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

const actualizarImagenProducto = async (req, res = response) => {
	try {
		console.log('SUBIENDO IMAGEN');

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
		console.log(imagenesPrevias);
		//no necesitamos que esto sea asincrono.
		imagenesPrevias.forEach((imagen) => {
			if (imagen) {
				const nombreArr = imagen.split('/');
				const nombreConExtension = nombreArr[nombreArr.length - 1];
				const nombreSinExtension = nombreConExtension.split('.')[0];
				console.log(nombreSinExtension);
				cloudinary.uploader.destroy(nombreSinExtension);
			}
		});
		const subirCloudinary = archivos.map((archivo) => {
			const tempPathFile = archivo.tempFilePath;
			const respUploadCloudinary = cloudinary.uploader.upload(tempPathFile);
			return respUploadCloudinary;
		});

		const esperarSubir = await Promise.all(subirCloudinary);
		console.log('termino subida');
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

module.exports = { actualizarImagenProducto };
