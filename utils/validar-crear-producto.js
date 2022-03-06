const { CalcularDescuento } = require('./calcular-descuento');
const Marca = require('../models/marca');
const Categoria = require('../models/categoria');
const { MAXRELEVANCIA, MINRELEVANCIA, MAXNOMBRE, MAXCATEGORIASPORPRODUCTO } = require('./constantes');

const ObjectId = require('mongodb').ObjectId;

const validarCrearProducto = ({
	producto,
	marcasValidas,
	categoriasValidas,
}) => {
	try {
		if (!producto || !marcasValidas || !categoriasValidas) {
			return {
				ok: false,
				error: 'Faltan datos',
			};
		}

		let {
			nombre,
			precio,
			porcentajedescuento = 0,
			relevancia = 2,
			marca,
			cantidad,
			descripcion = '',
			categoria1,
			categoria2,
			categoria3,
			row = -5,
		} = producto;

		//Limpiando datos
		nombre && (nombre = nombre.trim().toLowerCase());
		marca && (marca = marca.trim().toLowerCase());
		descripcion && (descripcion = descripcion.trim());
		categoria1 && (categoria1 = categoria1.trim().toLowerCase());
		categoria2 && (categoria2 = categoria2.trim().toLowerCase());
		categoria3 && (categoria3 = categoria3.trim().toLowerCase());

		categoria2 && (categoria2 = categoria2 == categoria1 ? null : categoria2);
		categoria3 && (categoria3 = categoria3 == categoria1 ? null : categoria3);

		(categoria2 || categoria3) &&
			categoria2 == categoria3 &&
			(categoria3 = null);

		let error = '';
		//comprobando el producto
		const isCeldaValida = () => {
			let celdaValida = true;
			if (!nombre) {
				error += 'No existe nombre. ';
				celdaValida = false;
			}
			if (!precio) {
				error += 'No existe precio. ';
				celdaValida = false;
			}
			if (!marca) {
				error += 'No existe marca. ';
				celdaValida = false;
			}
			if (!cantidad) {
				error += 'No existe cantidad. ';
				celdaValida = false;
			}
			if (!categoria1) {
				error += 'No existe categoria1. ';
				celdaValida = false;
			}
			if (precio && isNaN(precio)) {
				error += 'El precio no es un numero. ';
				celdaValida = false;
			}
			if (porcentajedescuento && isNaN(porcentajedescuento)) {
				error += 'El descuento no es un numero. ';
				celdaValida = false;
			}
			if (relevancia && isNaN(relevancia)) {
				error += 'La relevancia no es un numero. ';
				celdaValida = false;
			}
			if (cantidad && isNaN(cantidad)) {
				error += 'La cantidad no es un numero. ';
				celdaValida = false;
			}
			if (precio && precio <= 0) {
				error += 'El precio debe ser mayor a 0. ';
				celdaValida = false;
			}
			if (porcentajedescuento > 99) {
				error += 'El descuento debe ser menor o igual a 99%. ';
				celdaValida = false;
			}
			if (porcentajedescuento && porcentajedescuento < 0) {
				error += 'El descuento debe ser mayor o igual a 0. ';
				celdaValida = false;
			}
			if (relevancia < 0 || relevancia > 4) {
				error += 'La relevancia debe estar entre 0 y 4. ';
				celdaValida = false;
			}
			if (cantidad && cantidad < 0) {
				error += 'La cantidad debe ser mayor a 0. ';
				celdaValida = false;
			}
			// @ts-ignore
			if (marca && !marcasValidas.includes(marca)) {
				error += 'La marca no existe en la base de datos. ';
				celdaValida = false;
			}
			// @ts-ignore
			if (categoria1 && !categoriasValidas.includes(categoria1)) {
				error += 'La categoria1 no existe en la base de datos. ';
				celdaValida = false;
			}
			// @ts-ignore
			if (categoria2 && !categoriasValidas.includes(categoria2)) {
				error += 'La categoria2 no existe en la base de datos. ';
				celdaValida = false;
			}
			// @ts-ignore
			if (categoria3 && !categoriasValidas.includes(categoria3)) {
				error += 'La categoria3 no existe en la base de datos. ';
				celdaValida = false;
			}
			return celdaValida;
		};

		if (!isCeldaValida()) {
			return {
				ok: false,
				error: { row: row + 1, error },
			};
		}
		let categorias = [];
		categoria1 && categorias.push(categoria1);
		categoria2 && categorias.push(categoria2);
		categoria3 && categorias.push(categoria3);
		const descuento = CalcularDescuento(precio, porcentajedescuento);

		return {
			ok: true,
			producto: {
				nombre,
				precio,
				porcentajedescuento,
				descuento,
				relevancia,
				marca,
				cantidad,
				descripcion,
				categoria1,
				categoria2,
				categoria3,
				categorias,
				row,
			},
		};
	} catch (error) {
		return {
			ok: false,
			error: 'Error al intentar leer una fila',
		};
	}
};

const validarEditarMultiples = async ({
	nombre,
	precio,
	porcentaje_descuento,
	relevancia,
	categorias,
	marca,
	cantidad,
}) => {
	try {
		if (precio) {
			if (isNaN(precio)) return { ok: false, msg: 'El precio no es un numero' };
			precio = Math.round(precio);
			if (precio <= 0)
				return { ok: false, msg: 'El precio debe ser mayor a 0' };
		}
		if (porcentaje_descuento) {
			if (isNaN(porcentaje_descuento))
				return { ok: false, msg: 'El descuento no es un numero' };
			porcentaje_descuento = Math.floor(porcentaje_descuento);
			if (porcentaje_descuento < 0 || porcentaje_descuento > 99) {
				return { ok: false, msg: 'El descuento debe estar entre 0 y 99' };
			}
		}
		if (relevancia) {
			if (isNaN(relevancia))
				return { ok: false, msg: 'La relevancia no es un numero' };
			relevancia = Math.floor(relevancia);
			if (relevancia > MAXRELEVANCIA || relevancia < MINRELEVANCIA) {
				return { ok: false, msg: 'La relevancia no esta entre los rangos' };
			}
		}
		if (cantidad) {
			if (isNaN(cantidad))
				return { ok: false, msg: 'La cantidad no es un numero' };
			cantidad = Math.floor(cantidad);
			if (cantidad < 0)
				return { ok: false, msg: 'La cantidad no puede ser negativa' };
		}
		if (nombre) {
			if (nombre.length > MAXNOMBRE)
				return { ok: false, msg: 'El nombre es muy largo' };
			nombre = nombre.trim().toLowerCase();
		}
		if (categorias) {
			if (categorias.length > MAXCATEGORIASPORPRODUCTO)
				return { ok: false, msg: 'La cantidad de categorias es muy grande' };

			const categoriasEncontradas = await Categoria.find({
				_id: { $in: categorias },
			});
			if (categoriasEncontradas.length !== categorias.length) {
				return { ok: false, msg: 'Las categorias no existen' };
			}
			categorias = categoriasEncontradas.map((categoria) => categoria._id);
		}
		if (marca) {
			const marcaEncontrada = await Marca.findOne({ _id: marca });
			if (!marcaEncontrada) return { ok: false, msg: 'La marca no existe' };
			marca = marcaEncontrada._id;
		}
		return {
			ok: true,
			producto: {
				nombre,
				precio,
				porcentaje_descuento,
				relevancia,
				marca,
				cantidad,
				categorias,
			},
		};
	} catch (error) {
		return { ok: false, msg: 'Error al intentar leer un campo' };
	}
};

module.exports = { validarCrearProducto, validarEditarMultiples };
