const { response } = require('express');
const { ObjectId } = require('mongoose').Types;
const DetalleProducto = require('../models/detalle-producto');
const Producto = require('../models/producto');
const Categoria = require('../models/categoria');
const buscarCategoriasValidas = require('../utils/buscar-categorias-validas');
const { urlStyle } = require('../utils/url-style');
const { MAXCATEGORIASPORPRODUCTO } = require('../utils/constantes');
/*
  TODO: Almacenar nombres en mayusculas
*/

const crearProducto = async (req, res = response) => {
	try {
		const {
			nombre,
			precio,
			descripcion,
			categorias,
			relevancia,
			cantidad,
		} = req.body;
		const existeNombre = await Producto.findOne({
			nombre: nombre.toUpperCase(),
		});

		if (existeNombre) {
			return res.status(400).json({
				ok: false,
				msg: 'El nombre del producto ya existe: ' + nombre.toUpperCase(),
			});
		}
		const buscarCategorias = await buscarCategoriasValidas(
			categorias,
			MAXCATEGORIASPORPRODUCTO
		);
		if (!buscarCategorias.ok) {
			return res.status(400).json({
				ok: false,
				msg: buscarCategorias.msg
					? buscarCategorias.msg
					: 'Las siguientes categorias no existen: ' +
					  buscarCategorias.categorias,
			});
		}
		const idCategoriasEncontradas = buscarCategorias.categorias.map(
			(categ) => categ._id
		);

		const detallesAdicionales = new DetalleProducto({
			descripcion,
			cantidad,
		});
		const producto = new Producto({
			nombre: nombre.toUpperCase(),
			nombre_url: urlStyle(nombre),
			precio,
			categorias: idCategoriasEncontradas,
			relevancia,
			detalle_producto: detallesAdicionales._id,
		});

		await producto.save();
		await detallesAdicionales.save();
		console.log('SE AÑADIO PRODUCTO!!', producto);
		res.json({
			ok: true,
			producto,
			msg: 'Producto Añadido Correctamente',
			detalle_producto: detallesAdicionales._id,
		});
	} catch (error) {
		console.log(error);
		if (error.code === 11000) {
			return res.status(400).json({
				ok: false,
				msg:
					'Hay algun campo repetido, revise el nombre de su producto que no exista',
			});
		}
		return res.status(500).json({
			ok: false,
			msg: 'Error inesperado al crear Producto, consulte con el administrador',
		});
	}
};
/**
 * Este metodo se encarga de mostrar los productos de forma paginada
 *
 * Recibe en los params:
 * @param {Number} pagina - Numero de pagina (params) default: 1
 * @param {Number} limite - Numero de productos por pagina (params) default: 10
 *
 * Recibe en el body :
 * @param {String} sort_query - Campo por el cual se ordenara la busqueda (body) default: { }
 *
 * @return {JSON} - Retorna un JSON con los productos encontrados
 *
 *  **/
const mostrarProductosPage = async (req, res = response) => {
	try {
		const page = Number(req.query.page) || 1;
		const limit = Math.min(Number(req.query.limit), 30) || 12;
		const categoria = req.query.cat || undefined;
		const sort_query = req.body.sort_query || {};
		let productos = [];

		const optionsPagination = {
			page: page,
			limit: limit,
			sort: sort_query,
		};

		switch (categoria) {
			case undefined:
				productos = await Producto.paginate({}, optionsPagination);
				break;
			default:
				const esMongoIdCat = ObjectId.isValid(categoria);
				let categoriaId;

				if (esMongoIdCat) {
					categoriaId = categoria;
				} else {
					const categoriaDB = await Categoria.findOne({
						nombre: categoria.toUpperCase(),
					});
					if (categoriaDB) {
						categoriaId = categoriaDB._id;
					}
				}
				productos = await Producto.paginate(
					{
						categorias: categoriaId,
					},
					optionsPagination
				);
				break;
		}

		res.json({
			ok: true,
			productos,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			ok: false,
			msg:
				'Error inesperado al mostrar Productos, consulte con el administrador',
		});
	}
};

const mostrarProducto = async (req, res = response) => {
	try {
		const { id } = req.params;
		const isMongoId = ObjectId.isValid(id);
		if (!isMongoId) {
			req.params.nombre = id;
			return buscarProductoNombre(req, res);
		}
		const producto = await Producto.findById(id)
			.populate('detalle_producto', 'descripcion imagenes')
			.populate('categorias', 'nombre');
		if (!producto) {
			return res.status(404).json({
				ok: false,
				msg: 'No se encontro el producto',
			});
		}

		res.json({
			ok: true,
			producto,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			ok: false,
			msg:
				'Error inesperado al mostrar Producto, consulte con el administrador',
		});
	}
};

const buscarProductoNombre = async (req, res = response) => {
	try {
		const { nombre } = req.params;
		const producto = await Producto.findOne({
			nombre_url: nombre,
		})
			.populate('detalle_producto', 'descripcion imagenes')
			.populate('categorias', 'nombre');
		if (!producto) {
			return res.status(404).json({
				ok: false,
				msg: 'No se encontro el producto',
			});
		}

		res.json({
			ok: true,
			producto,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			ok: false,
			msg: 'Error inesperado al buscar Producto, consulte con el administrador',
		});
	}
};

const borrarProductoDefinitivamente = async (req, res = response) => {
	try {
		const { id } = req.params;
		const producto = await Producto.findById(id);
		if (!producto) {
			return res.status(404).json({
				ok: false,
				msg: 'No se encontro el producto',
			});
		}
		const detalleProductoId = await DetalleProducto.findById(
			producto.detalle_producto
		);

		await producto.remove();
		if (detalleProductoId) await detalleProductoId.remove();
		//TODO: BORRAR IMAGENES de CLOUDINARY
		res.json({
			ok: true,
			msg: 'Producto Eliminado Correctamente',
		});
	} catch (error) {}
};

module.exports = {
	crearProducto,
	mostrarProductosPage,
	mostrarProducto,
	buscarProductoNombre,
	borrarProductoDefinitivamente,
};
