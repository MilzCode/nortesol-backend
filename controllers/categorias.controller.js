const { response } = require('express');
const Categoria = require('../models/categoria');

/*
  TODO: Almacenar nombres en mayusculas
*/
const crearCategoria = async (req, res = response) => {
	try {
		const { nombre, descripcion } = req.body;
		const nuevaCategoria = new Categoria({
			nombre: nombre.toLowerCase(),
			descripcion,
		});
		await nuevaCategoria.save();
		return res.json({
			ok: true,
			msg: 'Categoria creada correctamente',
			categoria: nuevaCategoria,
		});
	} catch (error) {
		console.log(error);
		if (error.code === 11000) {
			return res.status(400).json({
				ok: false,
				msg: 'La categoria ya existe',
			});
		}
		return res.status(500).json({
			ok: false,
			msg: 'Error inesperado al crear categoria, consulte con el administrador',
		});
	}
};

const mostrarCategorias = async (req, res = response) => {
	try {
		const categorias = await Categoria.find({});
		return res.json({
			ok: true,
			categorias,
		});
	} catch (error) {
		return res.status(500).json({
			ok: false,
			msg:
				'Error inesperado al mostrar categorias, consulte con el administrador',
		});
	}
};

const buscarCategoria = async (req, res = response) => {
	try {
		const { id } = req.params;
		const categoria = await Categoria.findById(id);
		return res.json({
			ok: true,
			categoria,
		});
	} catch (error) {
		return res.status(500).json({
			ok: false,
			msg:
				'Error inesperado al buscar categoria, consulte con el administrador',
		});
	}
};

module.exports = {
	crearCategoria,
	mostrarCategorias,
	buscarCategoria,
};
