const { response } = require('express');
const Marca = require('../models/marca');

const mostrarMarcas = async (req, res) => {
	try {
		const marcas = await Marca.find({}).sort('nombre');
		return res.json({
			ok: true,
			marcas,
		});
	} catch (error) {
		return res.status(500).json({
			ok: false,
			msg: 'Error inesperado al mostrar marcas, consulte con el administrador',
		});
	}
};

const crearMarca = async (req, res) => {
	try {
		const { nombre } = req.body;
		const nuevaMarca = new Marca({
			nombre: nombre.toLowerCase().trim().replace('_', ' '),
		});
		await nuevaMarca.save();
		return res.json({
			ok: true,
			msg: 'Marca creada correctamente',
			marca: nuevaMarca,
		});
	} catch (error) {
		console.log(error);
		if (error.code === 11000) {
			return res.status(400).json({
				ok: false,
				msg: 'La marca ya existe',
			});
		}
		return res.status(500).json({
			ok: false,
			msg: 'Error inesperado al crear marca, consulte con el administrador',
		});
	}
};

module.exports = {
	mostrarMarcas,
	crearMarca,
};
