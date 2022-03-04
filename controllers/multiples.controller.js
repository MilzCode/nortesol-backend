const Producto = require('../models/producto');
const ProductoDes = require('../models/producto_desabilitado');
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
			}
		}
		if (!todoOk) {
			return res.status(400).json({
				ok: false,
				msg: 'Error en algunos productos',
				tipoError,
			});
		}
		//insertando productos
		await ProductoDes.insertMany(newProductos);
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
			const setNewFilter = ({
				busqueda,
				marcas,
				categorias,
				precio_min,
				precio_max,
				descuento_min,
				descuento_max,
				cantidad_min,
				cantidad_max,
				relevancia_min,
				relevancia_max,
				porcentaje_descuento_min,
				porcentaje_descuento_max,
			}) => {
				let newFilter = {};
				if (busqueda) {
					if (busqueda.length > MAXTEXTBUSQUEDAFILTER) {
						busqueda = busqueda.substring(0, MAXTEXTBUSQUEDAFILTER);
					}
					if (busqueda.length > 3) {
						busqueda = busqueda.slice(0, -3);
					}
					const busquedaRegex = new RegExp(busqueda, 'i');
					newFilter.nombre = busquedaRegex;
				}

				if (
					categorias &&
					categorias.length > 0 &&
					categorias.length <= MAXCATEGORIASFILTER
				) {
					newFilter.categorias_names = { $in: categorias };
				}
				if (descuento_min || descuento_max) {
					newFilter.descuento = {};
					descuento_min && (newFilter.descuento.$gte = Number(descuento_min));
					descuento_max && (newFilter.descuento.$lte = Number(descuento_max));
				}

				if (cantidad_min || cantidad_max) {
					newFilter.cantidad = {};
					cantidad_min && (newFilter.cantidad.$gte = Number(cantidad_min));
					cantidad_max && (newFilter.cantidad.$lte = Number(cantidad_max));
				}

				if (marcas && marcas.length > 0 && marcas.length <= MAXMARCASFILTER) {
					newFilter.marca_name = { $in: marcas };
				}
				if (precio_min || precio_max) {
					newFilter.precio = {};
					precio_min &&
						precio_min >= PRECIOMINFILTER &&
						(newFilter.precio.$gte = Number(precio_min));
					precio_max &&
						precio_max <= PRECIOMAXFILTER &&
						(newFilter.precio.$lte = Number(precio_max));
				}

				if (relevancia_min || relevancia_max) {
					newFilter.relevancia = {};
					relevancia_min &&
						(newFilter.relevancia.$gte = Number(relevancia_min));
					relevancia_max &&
						(newFilter.relevancia.$lte = Number(relevancia_max));
				}

				if (porcentaje_descuento_min || porcentaje_descuento_max) {
					newFilter.porcentaje_descuento = {};
					porcentaje_descuento_min &&
						(newFilter.porcentaje_descuento.$gte = Number(
							porcentaje_descuento_min
						));
					porcentaje_descuento_max &&
						(newFilter.porcentaje_descuento.$lte = Number(
							porcentaje_descuento_max
						));
				}
				return newFilter;
			};
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
			const setNewFilter = ({
				busqueda,
				marcas,
				categorias,
				precio_min,
				precio_max,
				descuento_min,
				descuento_max,
				cantidad_min,
				cantidad_max,
				relevancia_min,
				relevancia_max,
				porcentaje_descuento_min,
				porcentaje_descuento_max,
			}) => {
				let newFilter = {};
				if (busqueda) {
					if (busqueda.length > MAXTEXTBUSQUEDAFILTER) {
						busqueda = busqueda.substring(0, MAXTEXTBUSQUEDAFILTER);
					}
					if (busqueda.length > 3) {
						busqueda = busqueda.slice(0, -3);
					}
					const busquedaRegex = new RegExp(busqueda, 'i');
					newFilter.nombre = busquedaRegex;
				}

				if (
					categorias &&
					categorias.length > 0 &&
					categorias.length <= MAXCATEGORIASFILTER
				) {
					newFilter.categorias_names = { $in: categorias };
				}
				if (descuento_min || descuento_max) {
					newFilter.descuento = {};
					descuento_min && (newFilter.descuento.$gte = Number(descuento_min));
					descuento_max && (newFilter.descuento.$lte = Number(descuento_max));
				}

				if (cantidad_min || cantidad_max) {
					newFilter.cantidad = {};
					cantidad_min && (newFilter.cantidad.$gte = Number(cantidad_min));
					cantidad_max && (newFilter.cantidad.$lte = Number(cantidad_max));
				}

				if (marcas && marcas.length > 0 && marcas.length <= MAXMARCASFILTER) {
					newFilter.marca_name = { $in: marcas };
				}
				if (precio_min || precio_max) {
					newFilter.precio = {};
					precio_min &&
						precio_min >= PRECIOMINFILTER &&
						(newFilter.precio.$gte = Number(precio_min));
					precio_max &&
						precio_max <= PRECIOMAXFILTER &&
						(newFilter.precio.$lte = Number(precio_max));
				}

				if (relevancia_min || relevancia_max) {
					newFilter.relevancia = {};
					relevancia_min &&
						(newFilter.relevancia.$gte = Number(relevancia_min));
					relevancia_max &&
						(newFilter.relevancia.$lte = Number(relevancia_max));
				}

				if (porcentaje_descuento_min || porcentaje_descuento_max) {
					newFilter.porcentaje_descuento = {};
					porcentaje_descuento_min &&
						(newFilter.porcentaje_descuento.$gte = Number(
							porcentaje_descuento_min
						));
					porcentaje_descuento_max &&
						(newFilter.porcentaje_descuento.$lte = Number(
							porcentaje_descuento_max
						));
				}
				return newFilter;
			};
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

module.exports = {
	insertarProductos,
	habilitarProductos,
	deshabilitarProductos,
};
