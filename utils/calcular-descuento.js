const CalcularDescuento = (precio = 0, porcentaje = 0) => {
	if (isNaN(porcentaje) || isNaN(precio)) {
		return 0;
	}
	porcentaje = Math.floor(porcentaje);
	return Math.floor(precio * (porcentaje / 100));
};

module.exports = { CalcularDescuento };
