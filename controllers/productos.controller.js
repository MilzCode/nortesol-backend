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
		const idCategoriasEncontradas = buscarCategorias.categorias.map(
			(categ) => categ._id
		);

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
			relevancia,
			detalle_producto: detallesAdicionales._id,
			marca: buscarMarca._id,
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
		const productosFind = req.query.find_prod;
		const sort_query = {};
		let productos = {};

		const optionsPagination = {
			page: page,
			limit: limit,
			sort: sort_query,
		};

		switch (categoria) {
			case undefined:
				if (productosFind) {
					productos.docs = await Producto.find({
						pid: { $in: productosFind },
					})
						.limit(MAXPRODUCTOSCARRITO)
						.populate('detalle_producto', 'cantidad');
				} else {
					productos = await Producto.paginate({}, optionsPagination);
				}
				break;
			default:
				const esMongoIdCat = ObjectId.isValid(categoria);
				let categoriaId;

				if (esMongoIdCat) {
					categoriaId = categoria;
				} else {
					const categoriaDB = await Categoria.findOne({
						nombre: categoria.toLowerCase(),
					});
					if (categoriaDB) {
						categoriaId = categoriaDB._id;
					}
				}
				productos.docs = await Producto.find({
					categorias: categoriaId,
				}).limit(limit);
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
			NUEVADATA.categorias = buscarCategorias.categorias.map(
				(categ) => categ._id
			);
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

module.exports = {
	crearProducto,
	editarProducto,
	mostrarProductosPage,
	mostrarProducto,
	buscarProductoNombre,
	borrarProductoDefinitivamente,
};
