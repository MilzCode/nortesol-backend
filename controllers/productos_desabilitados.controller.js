const { response } = require('express');
const { nanoid } = require('nanoid');
const { ObjectId } = require('mongoose').Types;
const DetalleProducto = require('../models/detalle_producto');
const Producto = require('../models/producto_desabilitado');
const ProductoDesabilitado = require('../models/producto');
const Marca = require('../models/marca');
const Categoria = require('../models/categoria');
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
const { borrarImagenCloudinary } = require('../helpers/images-functions');
const { NewHistory } = require('../helpers/historial-functions');
const { CalcularDescuento } = require('../utils/calcular-descuento');
/*
  TODO: Almacenar nombres en minuscula
*/

const crearProducto = async (req, res = response) => {
	try {
		let {
			nombre,
			precio,
			descripcion,
			categorias,
			relevancia,
			cantidad,
			marca,
			porcentaje_descuento,
		} = req.body;
		const url = urlStyle(nombre) + '-' + nanoid();
		if (categorias.length > MAXCATEGORIASPORPRODUCTO || categorias.length < 1) {
			return res.status(400).json({
				ok: false,
				msg:
					'El producto no puede tener mas de ' +
					MAXCATEGORIASPORPRODUCTO +
					' categorias o menos de 1',
			});
		}
		if (precio < 0 || porcentaje_descuento < 0 || porcentaje_descuento > 100) {
			return res.status(400).json({
				ok: false,
				msg:
					'El precio o descuento no puede ser menor a 0, ni el precio menor al descuento',
			});
		}

		const categoriasEncontradas = await Categoria.find({
			_id: { $in: categorias },
		});
		if (!categoriasEncontradas) {
			return res.status(400).json({
				ok: false,
				msg: 'Hay categorias que no existen',
			});
		}

		const buscarMarca = await Marca.findById(marca);
		if (!buscarMarca) {
			return res.status(400).json({
				ok: false,
				msg: 'La marca no existe: ' + marca,
			});
		}
		if (
			(porcentaje_descuento && porcentaje_descuento > 100) ||
			porcentaje_descuento < 0
		) {
			return res.status(400).json({
				ok: false,
				msg: 'El porcentaje de descuento no puede ser mayor a 100 ni menor a 0',
			});
		}
		const pid = url[0] + nanoid();
		const detallesAdicionales = new DetalleProducto({
			descripcion,
			pid,
		});
		const producto = new Producto({
			nombre: nombre.toLowerCase(),
			nombre_url: url,
			precio: Math.round(precio),
			categorias: categoriasEncontradas.map((categoria) => categoria._id),
			relevancia,
			cantidad: Math.round(cantidad),
			marca: buscarMarca._id,
			pid: pid,
			porcentaje_descuento: Math.floor(porcentaje_descuento),
			descuento: CalcularDescuento(precio, porcentaje_descuento),
		});

		await producto.save();
		await detallesAdicionales.save();
		console.log('SE AÑADIO PRODUCTO!!', producto);
		console.log(req.usuarioAuth);
		NewHistory({
			tipo: 'Producto creado',
			usuario: req.usuarioAuth,
			detalle:
				'Se añadió el producto: ' + producto.nombre + ' Pid: ' + producto.pid,
		});
		res.json({
			ok: true,
			producto,
			msg: 'Producto Añadido Correctamente',
			detalle_producto: detallesAdicionales,
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
		console.log(error);

		return res.status(500).json({
			ok: false,
			msg: 'Error inesperado al crear Producto, consulte con el administrador',
		});
	}
};

const borrarProductoDefinitivamente = async (req, res = response) => {
	try {
		const { id } = req.params;
		const producto = await Producto.findOne({ nombre_url: id });
		if (!producto) {
			return res.status(404).json({
				ok: false,
				msg: 'No se encontro el producto',
			});
		}
		const pid = producto.pid;
		const detalleProductoId = await DetalleProducto.findOne({ pid });

		let imagenes = null;
		await producto.remove();
		if (detalleProductoId) {
			imagenes = detalleProductoId.imagenes;
			await detalleProductoId.remove();
		}
		//TODO: BORRAR IMAGENES de CLOUDINARY
		if (imagenes) {
			imagenes.forEach((imagen) => {
				borrarImagenCloudinary(imagen);
			});
		}
		res.json({
			ok: true,
			msg: 'Producto Eliminado Correctamente',
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			ok: false,
			msg: 'Hubo un error contacta al administrador.',
		});
	}
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
			marca,
			porcentaje_descuento,
		} = req.body;
		const { id } = req.params;

		if (categorias && categorias.length > MAXCATEGORIASPORPRODUCTO || categorias.length < 1) {
			return res.status(400).json({
				ok: false,
				msg:
					'El producto no puede tener mas de ' +
					MAXCATEGORIASPORPRODUCTO +
					' categorias o menos de 1',
			});
		}
		if (precio < 0 || porcentaje_descuento < 0 || porcentaje_descuento > 100) {
			return res.status(400).json({
				ok: false,
				msg:
					'El precio o descuento no puede ser menor a 0, ni el precio menor al descuento',
			});
		}
		const productoOriginal = await Producto.findById(id).populate(
			'categorias',
			'nombre'
		);
		let nuevoNombre = false;
		let nuevoPrecio = false;
		let nuevaDescripcion = false;
		let nuevasCategorias = false;
		let nuevaRelevancia = false;
		let nuevaCantidad = false;
		let nuevaMarca = false;
		let nuevoPorcentajeDescuento = false;
		let NUEVADATA = {};
		let NUEVODATADETALLE = {};

		if (!productoOriginal) {
			return res.status(404).json({
				ok: false,
				msg: 'No se encontro el producto',
			});
		}

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
		//TODO: validacion más estricta
		if (categorias && categorias.length > 0) {
			nuevasCategorias = true;
		}
		if (relevancia && relevancia != productoOriginal.relevancia) {
			nuevaRelevancia = true;
		}

		if (cantidad && cantidad != productoOriginal.cantidad) {
			nuevaCantidad = true;
		}

		//TODO: validacion más estricta
		if (marca && marca != productoOriginal.marca) {
			
			nuevaMarca = true;
		}
		if (
			porcentaje_descuento &&
			porcentaje_descuento != productoOriginal.porcentaje_descuento
		) {
			nuevoPorcentajeDescuento = true;
		}
		//@Fin de revision de nuevos ingresos
		/////////////////////////////////////////////////////////////////////
		//@Validando ingresos e guardando nueva data
		if (nuevoNombre) {
			const url = urlStyle(nombre) + '-' + nanoid();
			NUEVADATA.nombre = nombre.toLowerCase();
			NUEVADATA.nombre_url = url;
		}
		if (nuevoPrecio) {
			NUEVADATA.precio = Math.round(precio);
		}
		if (nuevaDescripcion) {
			NUEVODATADETALLE.descripcion = descripcion;
		}
		if (nuevasCategorias) {
			const categoriasEncontradas = await Categoria.find({
				_id: { $in: categorias },
			});

			if (!categoriasEncontradas) {
				return res.status(400).json({
					ok: false,
					msg: 'Hay categorias que no existen',
				});
			}

			NUEVADATA.categorias = categoriasEncontradas.map(
				(categoria) => categoria._id
			);
		}
		if (nuevaRelevancia) {
			NUEVADATA.relevancia = relevancia;
		}
		if (nuevaCantidad) {
			NUEVADATA.cantidad = Math.round(cantidad);
		}

		if (nuevaMarca) {
			const buscarMarca = await Marca.findById(marca);
			if (!buscarMarca) {
				return res.status(400).json({
					ok: false,
					msg: 'La marca no existe: ' + marca,
				});
			}
			NUEVADATA.marca = buscarMarca._id;
		}
		if (
			nuevoPorcentajeDescuento &&
			porcentaje_descuento >= 0 &&
			porcentaje_descuento < 100
		) {
			NUEVADATA.porcentaje_descuento = Math.floor(porcentaje_descuento);
			if (!precio) {
				NUEVADATA.descuento = CalcularDescuento(
					productoOriginal.precio,
					porcentaje_descuento
				);
			} else {
				NUEVADATA.descuento = CalcularDescuento(precio, porcentaje_descuento);
			}
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
		let detalle_producto;
		if (productoOriginal.pid) {
			const pidProductoOriginal = productoOriginal.pid;
			detalle_producto = await DetalleProducto.findOneAndUpdate(
				{ pid: pidProductoOriginal },
				NUEVODATADETALLE,
				{ new: true }
			);
		}

		if (!detalle_producto) {
			return res.status(400).json({
				ok: false,
				msg:
					'Se actualizo el producto pero no se pudo actualizar el detalle del producto',
			});
		}
		NewHistory({
			tipo: 'Producto actualizado',
			usuario: req.usuarioAuth,
			detalle: `Se actualizo el producto ${producto.nombre}, pid: ${producto.pid}`,
		});
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
 * Submetodo de buscar Productos
 */
const buscarProductoId = async (req, res, { id }) => {
	try {
		const producto = await Producto.findById(id)
			.populate('categorias', 'nombre')
			.populate('marca', 'nombre');

		if (!producto) {
			return res.status(404).json({
				ok: false,
				msg: 'No se encontro id producto',
			});
		}
		const pid = producto.pid;
		const detalle_producto = await DetalleProducto.findOne({ pid });

		res.json({
			ok: true,
			productos: { docs: [producto], page: 1, totalDocs: 1, totalPages: 1 },
			detalle_producto,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			ok: false,
			msg: 'Error inesperado al buscar Producto, consulte con el administrador',
		});
	}
};
/**
 * Submetodo de buscar Productos
 */
const buscarProductoNombre_url = async (req, res, { nombre_url }) => {
	try {
		const producto = await Producto.findOne({
			nombre_url,
		})
			.populate('categorias', 'nombre')
			.populate('marca', 'nombre');

		if (!producto) {
			return res.status(404).json({
				ok: false,
				msg: 'No se encontro nombre_url de producto',
			});
		}
		const pid = producto.pid;
		const detalle_producto = await DetalleProducto.findOne({ pid });

		res.json({
			ok: true,
			productos: { docs: [producto], page: 1, totalDocs: 1, totalPages: 1 },
			detalle_producto,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			ok: false,
			msg: 'Error inesperado al buscar Producto, consulte con el administrador',
		});
	}
};

/**
 * Este metodo se encarga de retornar productos de forma paginada
 */
const buscarProductos = async (req, res, mode) => {
	let {
		nombre_url,
		id,
		busqueda,
		categorias,
		descuento_min,
		descuento_max,
		cantidad_min,
		cantidad_max,
		marcas,
		precio_min,
		precio_max,
		relevancia_min,
		relevancia_max,
		find_productos_pids,
		populateCategorias,
		populateMarcas,
		porcentaje_descuento_min,
		porcentaje_descuento_max,
		//
		sortQuery,
	} = req.query;
	try {
		//@ingresos que retornan un solo producto
		if (nombre_url) {
			return buscarProductoNombre_url(req, res, { nombre_url });
		}
		if (id) {
			return buscarProductoId(req, res, { id });
		}

		//@fin de ingresos que retornan un solo producto
		//@Revisando los ingresos que retornan productos paginados
		let filters = {};
		if (busqueda) {
			if (busqueda.length > MAXTEXTBUSQUEDAFILTER) {
				busqueda = busqueda.substring(0, MAXTEXTBUSQUEDAFILTER);
			}
			if (busqueda.length > 3) {
				busqueda = busqueda.slice(0, -3);
			}
			const busquedaRegex = new RegExp(busqueda, 'i');
			filters.nombre = busquedaRegex;
		}

		if (
			categorias &&
			categorias.length > 0 &&
			categorias.length <= MAXCATEGORIASFILTER
		) {
			filters.categorias = { $in: categorias };
		}
		if (descuento_min || descuento_max) {
			filters.descuento = {};
			descuento_min && (filters.descuento.$gte = Number(descuento_min));
			descuento_max && (filters.descuento.$lte = Number(descuento_max));
		}

		if (cantidad_min || cantidad_max) {
			filters.cantidad = {};
			cantidad_min && (filters.cantidad.$gte = Number(cantidad_min));
			cantidad_max && (filters.cantidad.$lte = Number(cantidad_max));
		}

		if (marcas && marcas.length > 0 && marcas.length <= MAXMARCASFILTER) {
			filters.marca = { $in: marcas };
		}
		if (precio_min || precio_max) {
			filters.precio = {};
			precio_min &&
				precio_min >= PRECIOMINFILTER &&
				(filters.precio.$gte = Number(precio_min));
			precio_max &&
				precio_max <= PRECIOMAXFILTER &&
				(filters.precio.$lte = Number(precio_max));
		}

		if (relevancia_min || relevancia_max) {
			filters.relevancia = {};
			relevancia_min && (filters.relevancia.$gte = Number(relevancia_min));
			relevancia_max && (filters.relevancia.$lte = Number(relevancia_max));
		}
		if (find_productos_pids) {
			filters.pid = { $in: find_productos_pids };
		}
		if (porcentaje_descuento_min || porcentaje_descuento_max) {
			filters.porcentaje_descuento = {};
			porcentaje_descuento_min &&
				(filters.porcentaje_descuento.$gte = Number(porcentaje_descuento_min));
			porcentaje_descuento_max &&
				(filters.porcentaje_descuento.$lte = Number(porcentaje_descuento_max));
		}

		//@Fin de revisando los ingresos
		///////////////////////////////////////////////////////////////
		const page = Number(req.query.page) || 1;
		const limit = Math.min(Number(req.query.limit), 30) || 12;
		let optionsPagination = {
			page: page,
			limit: limit,
		};

		if (sortQuery) {
			const sortQueryJson = JSON.parse(sortQuery);
			const field = sortQueryJson.field;
			const sort = sortQueryJson.sort;
			if (field && sort) {
				const sortType =
					sortQueryJson.sort === 'asc' || sortQueryJson.sort === 1 ? 1 : -1;

				optionsPagination.sort = { [field]: sortType };
			}
		}
		optionsPagination.populate = '';
		if (populateMarcas) {
			optionsPagination.populate = 'marca';
		}
		if (populateCategorias) {
			populateMarcas && (optionsPagination.populate += ' ');
			optionsPagination.populate += 'categorias';
		}
		const productos = await Producto.paginate(filters, optionsPagination);

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

//quitarYMoverDeColeccion el producto hacia la collecion productos_desabilitados
const quitarYMoverDeColeccion = async (req, res) => {
	try {
		const { id } = req.params;
		const producto_ = await Producto.findById(id);
		if (!producto_) {
			return res.status(400).json({
				ok: false,
				msg: 'El producto no existe',
			});
		}

		let { _id, created_at, ...prodCopy } = producto_._doc;
		//date now
		created_at = new Date();
		const productoDesabilitado_ = new ProductoDesabilitado({
			...prodCopy,
			created_at,
		});
		await productoDesabilitado_.save();
		await producto_.remove();
		return res.json({ ok: true, msg: 'okokok' });
	} catch (error) {
		if (error.code === 11000) {
			return res.status(400).json({
				ok: false,
				msg:
					'El producto ya existe?, contacta al administrador si el problema persiste.',
			});
		}
		console.log(error);
		return res.status(500).json({ ok: false, msg: 'error' });
	}
};

module.exports = {
	crearProducto,
	editarProducto,
	borrarProductoDefinitivamente,
	buscarProductos,
	quitarYMoverDeColeccion,
};
