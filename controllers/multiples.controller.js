const Producto = require('../models/producto');
const ProductoDes = require('../models/producto_desabilitado');
const DetalleProducto = require('../models/detalle_producto');
const Marca = require('../models/marca');
const Categoria = require('../models/categoria');
const ObjectId = require('mongodb').ObjectId;
const setNewFilter = require('../utils/crear-filtro-mongo');
const { nanoid } = require('nanoid');
const {
	validarCrearProducto,
	validarEditarMultiples,
} = require('../utils/validar-crear-producto');
const { urlStyle } = require('../utils/url-style');
const { CalcularDescuento } = require('../utils/calcular-descuento');

const {
	MAXTEXTBUSQUEDAFILTER,
	MAXCATEGORIASFILTER,
	MAXMARCASFILTER,
	PRECIOMINFILTER,
	PRECIOMAXFILTER,
	MAXIMAGENESPORPRODUCTO,
} = require('../utils/constantes');
const { borrarImagenCloudinary } = require('../helpers/images-functions');
const {
	GetDefaultMarca,
	GetDefaultCategoria,
} = require('../helpers/get-defaults');

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
					cantidad,
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
	const { pids, filters, isFiltered } = req.body;

	if (!pids) {
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
				pid: { $in: pids },
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
			await ProductoDes.deleteMany({ pid: { $in: pids } });
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
	const { pids, filters, isFiltered } = req.body;
	if (!pids) {
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
				pid: { $in: pids },
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
			await Producto.deleteMany({ pid: { $in: pids } });
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
	let filterPids = null;
	let productosBorrados = false;
	let detallesBorrados = false;
	let imagenesBorradas = false;
	try {
		const { pids, filters, isFiltered } = req.body;
		if (!pids || pids.length === 0) {
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
			filterPids = productos.map((producto) => producto.pid);
		} else {
			productos = await ProductoDes.find({
				pid: { $in: pids },
			});
			filterPids = pids;
		}
		if (!productos) {
			return res.status(400).json({
				ok: false,
				msg: 'No se han encontrado productos',
			});
		}
		const imagenes = (
			await DetalleProducto.find({
				pid: { $in: filterPids },
			})
		).map((detalle_producto) => detalle_producto.imagenes);

		await ProductoDes.deleteMany({ pid: { $in: filterPids } });
		productosBorrados = true;
		await DetalleProducto.deleteMany({ pid: { $in: filterPids } });
		detallesBorrados = true;
		try {
			imagenes.forEach((imagenes_producto) => {
				imagenes_producto.forEach((imagen) => {
					borrarImagenCloudinary(imagen);
				});
			});
			imagenesBorradas = true;
		} catch (error) {
			console.log(error);
			console.log('Hubo un error al borrar las imagenes');
		}

		return res.json({ ok: true, msg: 'Productos Borrados' });
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			ok: false,
			msg: 'Error inesperado al Borrar productos',
			pids: filterPids,
			productosBorrados,
			detallesBorrados,
			imagenesBorradas,
		});
	}
};

const editManyProductos = async (req, res) => {
	try {
		const { pids, filters, isFiltered, newData } = req.body;
		if (!newData) {
			return res.status(400).json({
				ok: false,
				msg: 'No se han enviado datos',
			});
		}
		//validando Datos
		const productoValido = await validarEditarMultiples({ ...newData });
		if (!productoValido.ok) {
			return res.status(400).json({
				ok: false,
				msg: productoValido.msg,
			});
		}

		const {
			nombre,
			precio,
			porcentaje_descuento,
			relevancia,
			marca,
			cantidad,
			categorias,
		} = productoValido.producto;

		//Calculo de descuento
		let descuento = 0;
		if (porcentaje_descuento) {
			if (precio) {
				descuento = Math.floor(precio * (porcentaje_descuento / 100));
			} else {
				descuento = {
					$floor: {
						$multiply: [
							'$precio',
							{
								$divide: [porcentaje_descuento, 100],
							},
						],
					},
				};
			}
		} else if (precio) {
			descuento = {
				$floor: {
					$multiply: [
						precio,
						{
							$divide: ['$porcentaje_descuento', 100],
						},
					],
				},
			};
		} else {
			descuento = null;
		}
		const setProductos = Object.assign(
			{},
			descuento && { descuento },
			nombre && { nombre },
			precio && { precio },
			porcentaje_descuento && { porcentaje_descuento },
			relevancia && { relevancia },
			marca && { marca },
			(cantidad || cantidad === 0) && { cantidad },
			categorias && { categorias },
			{ created_at: new Date() }
		);

		if (isFiltered) {
			const newFilter = setNewFilter(filters);
			await Producto.updateMany(newFilter, [
				{
					$set: setProductos,
				},
			]);
		} else {
			await Producto.updateMany({ pid: { $in: pids } }, [
				{
					$set: setProductos,
				},
			]);
		}
		return res.json({ ok: true, msg: 'Productos editados' });
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			ok: false,
			msg: 'Error inesperado al editar productos',
		});
	}
};
const editManyProductosDes = async (req, res) => {
	try {
		const { pids, filters, isFiltered, newData } = req.body;

		if (!newData) {
			return res.status(400).json({
				ok: false,
				msg: 'No se han enviado datos',
			});
		}
		//validando Datos
		const productoValido = await validarEditarMultiples({ ...newData });

		if (!productoValido.ok) {
			return res.status(400).json({
				ok: false,
				msg: productoValido.msg,
			});
		}
		const {
			nombre,
			precio,
			porcentaje_descuento,
			relevancia,
			marca,
			cantidad,
			categorias,
		} = productoValido.producto;

		//Calculo de descuento
		let descuento = 0;
		if (porcentaje_descuento) {
			if (precio) {
				descuento = Math.floor(precio * (porcentaje_descuento / 100));
			} else {
				descuento = {
					$floor: {
						$multiply: [
							'$precio',
							{
								$divide: [porcentaje_descuento, 100],
							},
						],
					},
				};
			}
		} else if (precio) {
			descuento = {
				$floor: {
					$multiply: [
						precio,
						{
							$divide: ['$porcentaje_descuento', 100],
						},
					],
				},
			};
		} else {
			descuento = null;
		}
		const setProductos = Object.assign(
			{},
			descuento && { descuento },
			nombre && { nombre },
			precio && { precio },
			porcentaje_descuento && { porcentaje_descuento },
			relevancia && { relevancia },
			marca && { marca },
			(cantidad || cantidad === 0) && { cantidad },
			categorias && { categorias },
			{ created_at: new Date() }
		);

		if (isFiltered) {
			const newFilter = setNewFilter(filters);
			await ProductoDes.updateMany(newFilter, [
				{
					$set: setProductos,
				},
			]);
		} else {
			await ProductoDes.updateMany({ pid: { $in: pids } }, [
				{
					$set: setProductos,
				},
			]);
		}
		return res.json({ ok: true, msg: 'Productos editados' });
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			ok: false,
			msg: 'Error inesperado al editar productos',
		});
	}
};

const editManyMarcas = async (req, res) => {
	try {
		const { newData = [] } = req.body;
		if (!newData[0]) {
			return res.status(400).json({
				ok: false,
				msg: 'No se han enviado datos',
			});
		}
		const newDataValues = newData.map((data) => data.value);
		const newDataValuesNorepetidos = newDataValues.every(
			(value, index, self) => self.indexOf(value) === index
		);
		if (!newDataValuesNorepetidos) {
			return res.status(400).json({
				ok: false,
				msg: 'No se permiten nuevos datos repetidos.',
			});
		}
		const newDataExist = await Marca.find({
			nombre: { $in: newDataValues },
		});
		if (newDataExist.length > 0) {
			return res.status(400).json({
				ok: false,
				msg: 'Hay nuevos ingresos que ya existen en la base de datos.',
			});
		}
		//excluir marca defualt
		const defaultDataId = (await GetDefaultMarca())._id.toString();
		const update = newData.map((data) => {
			if (defaultDataId == data.id) {
				return null;
			}
			return Marca.findByIdAndUpdate(data.id, { nombre: data.value });
		});
		await Promise.all(update);

		await GetDefaultMarca();
		return res.json({ ok: true, msg: 'Marcas editadas' });
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			ok: false,
			msg: 'Error inesperado al editar marcas',
		});
	}
};
const editManyCategorias = async (req, res) => {
	try {
		const { newData = [] } = req.body;
		if (!newData[0]) {
			return res.status(400).json({
				ok: false,
				msg: 'No se han enviado datos',
			});
		}
		const newDataValues = newData.map((data) => data.value);
		const newDataValuesNorepetidos = newDataValues.every(
			(value, index, self) => self.indexOf(value) === index
		);
		if (!newDataValuesNorepetidos) {
			return res.status(400).json({
				ok: false,
				msg: 'No se permiten nuevos datos repetidos.',
			});
		}
		const newDataExist = await Categoria.find({
			nombre: { $in: newDataValues },
		});
		if (newDataExist.length > 0) {
			return res.status(400).json({
				ok: false,
				msg: 'Hay nuevos ingresos que ya existen en la base de datos.',
			});
		}
		//exluir categorias default
		const defaultDataId = (await GetDefaultCategoria())._id.toString();
		const update = newData.map((data) => {
			if (defaultDataId == data.id) {
				return null;
			}
			return Categoria.findByIdAndUpdate(data.id, { nombre: data.value });
		});
		await Promise.all(update);
		await GetDefaultCategoria();
		return res.json({ ok: true, msg: 'Marcas editadas' });
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			ok: false,
			msg: 'Error inesperado al editar marcas',
		});
	}
};

const borrarManyMarcas = async (req, res) => {
	let { ids = [] } = req.body;
	try {
		if (ids.length === 0) {
			return res
				.status(400)
				.json({ ok: false, msg: 'No se han enviado datos' });
		}
		//excluir marca default
		const defaultData = await GetDefaultMarca();
		ids = ids.filter((id) => id !== defaultData._id.toString());

		await ProductoDes.updateMany(
			{ marca: { $in: ids } },
			{ marca: defaultData._id }
		);
		await Producto.updateMany(
			{ marca: { $in: ids } },
			{ marca: defaultData._id }
		);
		await Marca.deleteMany({ _id: { $in: ids } });

		return res.json({ ok: true, msg: 'Marcas borradas' });
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			ok: false,
			msg: 'Error inesperado al borrar marcas',
		});
	}
};
const borrarManyCategorias = async (req, res) => {
	let { ids = [] } = req.body;
	try {
		if (ids.length === 0) {
			return res
				.status(400)
				.json({ ok: false, msg: 'No se han enviado datos' });
		}
		//excluir categiria default
		const defaultData = await GetDefaultCategoria();
		ids = ids.filter((id) => id !== defaultData._id.toString());

		await ProductoDes.updateMany(
			{ categorias: { $in: ids } },
			{
				$set: {
					'categorias.$': defaultData._id,
				},
				arrayFilters: [{ categorias: { $in: ids } }],
			}
		);
		await Producto.updateMany(
			{ categorias: { $in: ids } },
			{
				$set: {
					'categorias.$': defaultData._id,
				},
				arrayFilters: [{ categorias: { $in: ids } }],
			}
		);

		await Categoria.deleteMany({ _id: { $in: ids } });

		return res.json({ ok: true, msg: 'Categorias borradas' });
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			ok: false,
			msg: 'Error inesperado al borrar categorias',
		});
	}
};

const insertarMarcas = async (req, res) => {
	try {
		const { data = [] } = req.body;
		let newData = [];
		const arrayValues = data.map((data) => {
			if (data.nombre) {
				newData.push({ nombre: data.nombre });
			}
			return data.nombre;
		});
		const marcasExists = await Marca.find({ nombre: { $in: arrayValues } });
		if (marcasExists && marcasExists.length > 0) {
			return res.status(400).json({
				ok: false,
				msg: 'Hay nuevos ingresos que ya existen en la base de datos.',
			});
		}

		await Marca.insertMany(newData);
		return res.json({ ok: true, msg: 'Marcas insertadas' });
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			ok: false,
			msg: 'Error inesperado al insertar marcas',
		});
	}
};
const insertarCategorias = async (req, res) => {
	try {
		const { data = [] } = req.body;
		let newData = [];
		const arrayValues = data.map((data) => {
			if (data.nombre) {
				newData.push({ nombre: data.nombre });
			}
			return data.nombre;
		});
		const categoriasExists = await Categoria.find({
			nombre: { $in: arrayValues },
		});
		if (categoriasExists && categoriasExists.length > 0) {
			return res.status(400).json({
				ok: false,
				msg: 'Hay nuevos ingresos que ya existen en la base de datos.',
			});
		}

		await Categoria.insertMany(newData);
		return res.json({ ok: true, msg: 'Categorias insertadas' });
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			ok: false,
			msg: 'Error inesperado al insertar categorias',
		});
	}
};

module.exports = {
	insertarProductos,
	habilitarProductos,
	deshabilitarProductos,
	borrarProductosDes,
	editManyProductos,
	editManyProductosDes,
	editManyMarcas,
	editManyCategorias,
	borrarManyMarcas,
	borrarManyCategorias,
	insertarMarcas,
	insertarCategorias
};
