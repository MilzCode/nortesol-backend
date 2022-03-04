const Producto = require('../models/producto');
const ProductoDes = require('../models/producto_desabilitado');
const DetalleProducto = require('../models/detalle_producto');
const ObjectId = require('mongodb').ObjectId;
const setNewFilter = require('../utils/crear-filtro-mongo');
const Marca = require('../models/marca');
const { nanoid } = require('nanoid');
const Categoria = require('../models/categoria');
const validarCrearProducto = require('../utils/validar-crear-producto');
const { urlStyle } = require('../utils/url-style');
const {
	MAXTEXTBUSQUEDAFILTER,
	MAXCATEGORIASFILTER,
	MAXMARCASFILTER,
	PRECIOMINFILTER,
	PRECIOMAXFILTER,
} = require('../utils/constantes');

const insertarProductos = async (req, res) => {
	try {
		const { productos } = req.body;
		if (!productos) {
			return res.status(400).json({
				ok: false,
				msg: 'No se han enviado productos',
			});
		}
		const nombreTodasMarcas = (await Marca.find({}).select('nombre')).map(
			(m) => m.nombre
		);
		const nombreTodasCategorias = (
			await Categoria.find({}).select('nombre')
		).map((c) => c.nombre);
		let todoOk = true;
		let tipoError = 'producto';
		let newProductos = [];
		let newDetalles = [];

		//validando entradas
		for (let i = 0; i < productos.length; i++) {
			const productoRes = validarCrearProducto({
				producto: productos[i],
				marcasValidas: nombreTodasMarcas,
				categoriasValidas: nombreTodasCategorias,
			});
			if (!productoRes.ok) {
				todoOk = false;
				break;
			}
			if (productoRes.ok) {
				const {
					nombre,
					precio,
					porcentajedescuento: porcentaje_descuento,
					descuento,
					relevancia,
					marca: marca_name,
					cantidad,
					descripcion,
					categorias: categorias_names,
				} = productoRes.producto;
				const marcaRes = await Marca.findOne({ nombre: marca_name }).select(
					'_id'
				);
				const categoriasRes = await Categoria.find({
					nombre: { $in: categorias_names },
				}).select('_id');
				if (!marcaRes || !categoriasRes) {
					todoOk = false;
					tipoError = 'marca o categoria no encontrada';
					break;
				}
				const marca_id = marcaRes._id;
				const categorias_ids = categoriasRes.map((c) => c._id);
				const pid = nombre[0] + nanoid();
				const nombre_url = urlStyle(nombre) + '-' + nanoid();

				newProductos.push({
					nombre,
					precio,
					porcentaje_descuento,
					descuento,
					relevancia,
					marca_name,
					cantidad,
					categorias_names,
					marca: marca_id,
					categorias: categorias_ids,
					pid,
					nombre_url,
				});
				newDetalles.push({ descripcion, pid });
			}
		}
		if (!todoOk) {
			return res.status(400).json({
				ok: false,
				msg: 'Error en algunos productos, no se han insertado',
				tipoError,
			});
		}
		//insertando productos
		const productoIngresado = (await ProductoDes.insertMany(newProductos))[0];
		if (productoIngresado) {
			try {
				await DetalleProducto.insertMany(newDetalles);
			} catch (error) {
				console.log(error);
				return res.json({
					ok: true,
					msg:
						'Ingreso de productos con exito, pero no se pudieron ingresar los detalles',
				});
			}
		}
		return res.json({ ok: true, msg: 'Ingreso de productos con exito' });
	} catch (error) {
		console.log(error);
		return res
			.status(500)
			.json({ ok: false, msg: 'Error inesperado al crear productos' });
	}
};

const habilitarProductos = async (req, res) => {
	const { ids: productosIds, filters, isFiltered } = req.body;

	if (!productosIds) {
		return res.status(400).json({
			ok: false,
			msg: 'No se han enviado ids de productos',
		});
	}
	let ingresadosNoBorrados = false;
	try {
		let productos = null;
		let newFilter = {};
		if (isFiltered) {
			newFilter = setNewFilter(filters);
			productos = await ProductoDes.find(newFilter).select(
				'-created_at -_id -__v'
			);
		} else {
			productos = await ProductoDes.find({
				_id: { $in: productosIds },
			}).select('-created_at -_id -__v');
		}
		if (!productos) {
			return res.status(400).json({
				ok: false,
				msg: 'No se han encontrado productos',
			});
		}
		await Producto.insertMany(productos);
		ingresadosNoBorrados = true;
		if (isFiltered) {
			await ProductoDes.deleteMany(newFilter);
		} else {
			await ProductoDes.deleteMany({ _id: { $in: productosIds } });
		}
		return res.json({ ok: true, msg: 'Productos habilitados' });
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			ok: false,
			msg: 'Error inesperado al habilitar productos',
			ingresadosNoBorrados,
		});
	}
};
const deshabilitarProductos = async (req, res) => {
	const { ids: productosIds, filters, isFiltered } = req.body;
	if (!productosIds) {
		return res.status(400).json({
			ok: false,
			msg: 'No se han enviado ids de productos',
		});
	}
	let ingresadosNoBorrados = false;
	try {
		let productos = null;
		let newFilter = {};
		if (isFiltered) {
			newFilter = setNewFilter(filters);
			productos = await Producto.find(newFilter).select(
				'-created_at -_id -__v'
			);
		} else {
			productos = await Producto.find({
				_id: { $in: productosIds },
			}).select('-created_at -_id -__v');
		}
		if (!productos) {
			return res.status(400).json({
				ok: false,
				msg: 'No se han encontrado productos',
			});
		}
		await ProductoDes.insertMany(productos);
		ingresadosNoBorrados = true;
		if (isFiltered) {
			await Producto.deleteMany(newFilter);
		} else {
			await Producto.deleteMany({ _id: { $in: productosIds } });
		}
		return res.json({ ok: true, msg: 'Productos habilitados' });
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			ok: false,
			msg: 'Error inesperado al habilitar productos',
			ingresadosNoBorrados,
		});
	}
};

const borrarProductosDes = async (req, res) => {
	try {
		const { productosIds, filters, isFiltered } = req.body;
		if (!productosIds || productosIds.length === 0) {
			return res.status(400).json({
				ok: false,
				msg: 'No se han encontrado productos',
			});
		}
		let productos = null;
		let newFilter = {};
		if (isFiltered) {
			newFilter = setNewFilter(filters);
			productos = await ProductoDes.find(newFilter);
		} else {
			productos = await ProductoDes.find({
				_id: { $in: productosIds },
			});
		}
		if (!productos) {
			return res.status(400).json({
				ok: false,
				msg: 'No se han encontrado productos',
			});
		}
		await ProductoDes.deleteMany({ _id: { $in: productosIds } });
		return res.json({ ok: true, msg: 'Productos Borrados' });
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			ok: false,
			msg: 'Error inesperado al Borrar productos',
		});
	}
};

module.exports = {
	insertarProductos,
	habilitarProductos,
	deshabilitarProductos,
	borrarProductosDes,
};
