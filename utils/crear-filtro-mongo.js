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
		relevancia_min && (newFilter.relevancia.$gte = Number(relevancia_min));
		relevancia_max && (newFilter.relevancia.$lte = Number(relevancia_max));
	}

	if (porcentaje_descuento_min || porcentaje_descuento_max) {
		newFilter.porcentaje_descuento = {};
		porcentaje_descuento_min &&
			(newFilter.porcentaje_descuento.$gte = Number(porcentaje_descuento_min));
		porcentaje_descuento_max &&
			(newFilter.porcentaje_descuento.$lte = Number(porcentaje_descuento_max));
	}
	return newFilter;
};

module.exports = setNewFilter;
