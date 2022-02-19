const { response } = require('express');
const { v4: uuidv4 } = require('uuid');
const { ObjectId } = require('mongoose').Types;
const DetalleProducto = require('../models/detalle-producto');
const Producto = require('../models/producto');
const Categoria = require('../models/categoria');
const Marca = require('../models/marca');
const buscarCategoriasValidas = require('../utils/buscar-categorias-validas');
const { urlStyle } = require('../utils/url-style');
const {
	MAXCATEGORIASPORPRODUCTO,
	NOMONGOIDKEY_DONOTCHANGE,
	SEPARADOR,
	MAXPRODUCTOSCARRITO,
	PRECIOMAXFILTER,
	PRECIOMINFILTER,
	MAXCATEGORIASFILTER,
	MAXMARCASFILTER,
	MAXTEXTBUSQUEDAFILTER,
} = require('../utils/constantes');
const CompareArray = require('../utils/comparar-arrays');
/*
  TODO: Almacenar nombres en minuscula
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
			marca,
		} = req.body;
		const url = urlStyle(nombre);
		if (categorias.length > MAXCATEGORIASPORPRODUCTO) {
			return res.status(400).json({
				ok: false,
				msg:
					'El producto no puede tener mas de ' +
					MAXCATEGORIASPORPRODUCTO +
					' categorias',
			});
		}
		const existeNombreUrl = await Producto.findOne({
			nombre_url: url,
		});

		if (existeNombreUrl || nombre.includes(SEPARADOR)) {
			return res.status(400).json({
				ok: false,
				msg: 'El nombre del producto ya existe: ' + nombre.toLowerCase(),
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
		let nombresCategoriasEncontradas = [];
		const idCategoriasEncontradas = buscarCategorias.categorias.map((categ) => {
			nombresCategoriasEncontradas.push(categ.nombre);
			return categ._id;
		});

		const detallesAdicionales = new DetalleProducto({
			descripcion,
			cantidad,
		});
		let buscarMarca = null;
		if (!marca) {
			marca = 'otras';
		} else {
			buscarMarca = await Marca.findOne({ nombre: marca.toLowerCase() });
		}
		if (!buscarMarca) {
			return res.status(400).json({
				ok: false,
				msg: 'La marca no existe: ' + marca,
			});
		}
		const producto = new Producto({
			nombre: nombre.toLowerCase(),
			nombre_url: url,
			precio,
			categorias: idCategoriasEncontradas,
			categorias_names: nombresCategoriasEncontradas,
			relevancia,
			detalle_producto: detallesAdicionales._id,
			marca: buscarMarca._id,
			marca_name: buscarMarca.nombre,
			pid: url[0] + uuidv4() + url[url.length - 1],
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

const mostrarProducto = async (req, res = response) => {
	try {
		let { id } = req.params;
		const isNombre = id.includes(NOMONGOIDKEY_DONOTCHANGE);
		const isMongoId = ObjectId.isValid(id) && !isNombre;
		id = id.split(NOMONGOIDKEY_DONOTCHANGE).slice(1).join('');
		if (!isMongoId) {
			req.params.nombre = id.toLowerCase();
			return buscarProductoNombre(req, res);
		}
		const producto = await Producto.findById(id)
			.populate('detalle_producto', 'descripcion imagenes cantidad')
			.populate('categorias', 'nombre')
			.populate('marca', 'nombre');

		if (!producto) {
			return res.status(404).json({
				ok: false,
				msg: 'No se encontro el producto (1*)',
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
			.populate('detalle_producto', 'descripcion imagenes cantidad')
			.populate('categorias', 'nombre')
			.populate('marca', 'nombre');

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

const editarProducto = async (req, res = response) => {
	try {
		let {
			nombre,
			precio,
			descripcion,
			categorias,
			relevancia,
			cantidad,
			descuento,
			marca,
		} = req.body;
		const { id } = req.params;
		if (categorias && categorias.length > MAXCATEGORIASPORPRODUCTO) {
			return res.status(400).json({
				ok: false,
				msg:
					'El producto no puede tener mas de ' +
					MAXCATEGORIASPORPRODUCTO +
					' categorias',
			});
		}
		const productoOriginal = await Producto.findById(id)
			.populate('categorias', 'nombre')
			.populate('detalle_producto');
		let nuevoNombre = false;
		let nuevoPrecio = false;
		let nuevaDescripcion = false;
		let nuevasCategorias = false;
		let nuevaRelevancia = false;
		let nuevaCantidad = false;
		let nuevoDescuento = false;
		let nuevaMarca = false;

		let NUEVADATA = {};
		let NUEVODATADETALLE = {};

		if (!productoOriginal) {
			return res.status(404).json({
				ok: false,
				msg: 'No se encontro el producto',
			});
		}
		const idDetalleProducto = productoOriginal.detalle_producto._id;

		//@Revisando los nuevos ingresos
		if (nombre && nombre !== productoOriginal.nombre) {
			nuevoNombre = true;
		}
		if (precio && precio != productoOriginal.precio) {
			nuevoPrecio = true;
		}
		if (descripcion && descripcion != productoOriginal.descripcion) {
			nuevaDescripcion = true;
		}

		if (categorias && categorias.length > 0) {
			const categoriasOriginal = productoOriginal.categorias.map(
				(c) => c.nombre
			);
			if (!CompareArray(categoriasOriginal, categorias)) {
				nuevasCategorias = true;
			}
		}
		if (relevancia && relevancia != productoOriginal.relevancia) {
			nuevaRelevancia = true;
		}

		if (cantidad && cantidad != productoOriginal.cantidad) {
			nuevaCantidad = true;
		}
		if (descuento && descuento != productoOriginal.descuento) {
			nuevoDescuento = true;
		}

		if (marca && marca != productoOriginal.marca) {
			nuevaMarca = true;
		}
		//@Fin de revision de nuevos ingresos
		/////////////////////////////////////////////////////////////////////
		//@Validando ingresos e guardando nueva data
		if (nuevoNombre) {
			const url = urlStyle(nombre);
			//validamos que la url no exista
			const existeNombreurl = await Producto.findOne({
				nombre_url: url,
			});
			if (existeNombreurl || nombre.includes(SEPARADOR)) {
				return res.status(400).json({
					ok: false,
					msg: 'El nombre del producto ya existe: ' + nombre.toLowerCase(),
				});
			}
			NUEVADATA.nombre = nombre.toLowerCase();
			NUEVADATA.nombre_url = url;
		}
		if (nuevoPrecio) {
			NUEVADATA.precio = precio;
		}
		if (nuevaDescripcion) {
			NUEVODATADETALLE.descripcion = descripcion;
		}
		if (nuevasCategorias) {
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
			let categoriasNames = [];
			NUEVADATA.categorias = buscarCategorias.categorias.map((categ) => {
				categoriasNames.push(categ.nombre);
				return categ._id;
			});
			NUEVADATA.categorias_names = categoriasNames;
		}
		if (nuevaRelevancia) {
			NUEVADATA.relevancia = relevancia;
		}
		if (nuevaCantidad) {
			NUEVODATADETALLE.cantidad = cantidad;
		}
		if (nuevoDescuento) {
			NUEVADATA.descuento = descuento;
		}

		if (nuevaMarca) {
			const buscarMarca = await Marca.findOne({
				nombre: marca.toLowerCase(),
			});
			if (!buscarMarca) {
				return res.status(400).json({
					ok: false,
					msg: 'La marca no existe: ' + marca,
				});
			}
			NUEVADATA.marca = buscarMarca._id;
			NUEVADATA.marca_name = buscarMarca.nombre;
		}
		//@Fin de Validacion de ingresos e guardado de nueva data
		/////////////////////////////////////////////////////////////////////
		//@Ingreso de nueva data
		const producto = await Producto.findByIdAndUpdate(id, NUEVADATA, {
			new: true,
		});
		if (!producto) {
			return res.status(400).json({
				ok: false,
				msg: 'No se pudo actualizar el producto',
			});
		}
		console.log('se actualizo producto');
		const detalle_producto = await DetalleProducto.findByIdAndUpdate(
			idDetalleProducto,
			NUEVODATADETALLE,
			{ new: true }
		);
		if (!detalle_producto) {
			return res.status(400).json({
				ok: false,
				msg:
					'Se actualizo el producto pero no se pudo actualizar el detalle del producto',
			});
		}
		console.log('Se actualizo detalle');
		return res.json({
			ok: true,
			msg: 'Producto actualizado con exito',
			producto,
			detalle_producto,
		});
		//@Fin de ingreso de nueva data
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
 */
const buscarProductosFiltros = async (req, res, mode) => {
	let {
		busqueda,
		cantidad,
		categorias,
		descuento_min,
		marcas,
		precio_min,
		precio_max,
		relevancia,
		find_productos_pids,
		//
		sortFechaDesc,
		sortNombreDesc,
		sortDescuentoDesc,
		sortRelevanciaDesc,
		sortPrecio,
		sortPrecioDesc,
	} = req.query;

	try {
		let filters = {};
		//@Revisando los ingresos
		if (busqueda) {
			if (busqueda.length > MAXTEXTBUSQUEDAFILTER) {
				busqueda = busqueda.substring(0, MAXTEXTBUSQUEDAFILTER);
			}
			if (busqueda.length > 3) {
				busqueda = busqueda.slice(0, -2);
			}
			const busquedaRegex = new RegExp(busqueda, 'i');
			filters.nombre = busquedaRegex;
		}
		if (cantidad) {
			filters.cantidad = { $gte: Number(cantidad) };
		}
		if (
			categorias &&
			categorias.length > 0 &&
			categorias.length <= MAXCATEGORIASFILTER
		) {
			filters.categorias_names = { $in: categorias };
		}
		if (descuento_min) {
			filters.descuento = { $gte: Number(descuento_min) };
		}
		if (marcas && marcas.length > 0 && marcas.length <= MAXMARCASFILTER) {
			filters.marca_name = { $in: marcas };
		}
		if (precio_min && precio_min >= PRECIOMINFILTER) {
			filters.precio = { $gte: Number(precio_min) };
		}
		if (precio_max && precio_max <= PRECIOMAXFILTER) {
			filters.precio = { $lte: Number(precio_max) };
		}
		if (relevancia) {
			filters.relevancia = { $gte: Number(relevancia) };
		}
		if (find_productos_pids) {
			filters.pid = { $in: find_productos_pids };
		}
		//@Fin de revisando los ingresos
		///////////////////////////////////////////////////////////////
		const page = Number(req.query.page) || 1;
		const limit = Math.min(Number(req.query.limit), 30) || 12;
		let optionsPagination = {
			page: page,
			limit: limit,
		};
		let productos = [];
		if (sortFechaDesc) {
			optionsPagination.sort = { created_at: -1 };
			productos = await Producto.paginate(filters, optionsPagination);
		} else if (sortNombreDesc) {
			optionsPagination.sort = { nombre: -1 };
			productos = await Producto.paginate(filters, optionsPagination);
		} else if (sortDescuentoDesc) {
			optionsPagination.sort = { descuento: -1 };
			productos = await Producto.paginate(filters, optionsPagination);
		} else if (sortRelevanciaDesc) {
			optionsPagination.sort = { relevancia: -1 };
			productos = await Producto.paginate(filters, optionsPagination);
		} else if (sortPrecio) {
			optionsPagination.sort = { precio: 1 };
			productos = await Producto.paginate(filters, optionsPagination);
		} else if (sortPrecioDesc) {
			optionsPagination.sort = { precio: -1 };
			productos = await Producto.paginate(filters, optionsPagination);
		} else {
			productos = await Producto.paginate(filters, optionsPagination);
		}
		return res.json({ ok: true, productos });
	} catch (err) {
		console.log(err);
		return res.status(400).json({
			ok: false,
			msg:
				'¿Algun parametro de busqueda es incorrecto?, sino es así consulte al administrador',
		});
	}
};

module.exports = {
	crearProducto,
	editarProducto,
	mostrarProducto,
	buscarProductoNombre,
	borrarProductoDefinitivamente,
	buscarProductosFiltros,
};
