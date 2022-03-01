const Producto = require('../models/producto');

const insertarProductos = async (req, res) => {
	const { productos } = req.body;
	const productosInsertados = [];
	

	return res.json({ productosInsertados });
};
