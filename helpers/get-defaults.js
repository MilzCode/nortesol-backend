const Marca = require('../models/marca');
const Categoria = require('../models/categoria');

const GetDefaultMarca = async () => {
	try {
		let findMarca = await Marca.findOne({ nombre: 'otras' });
		if (!findMarca) {
			findMarca = await Marca.create({ nombre: 'otras' });
		}
		return findMarca;
	} catch (error) {
		console.log(error);
		return null;
	}
};

const GetDefaultCategoria = async () => {
	try {
		let findCategoria = await Categoria.findOne({ nombre: 'otras' });
		if (!findCategoria) {
			findCategoria = await Categoria.create({ nombre: 'otras' });
		}
		return findCategoria;
	} catch (error) {
		console.log(error);
		return null;
	}
};

module.exports = { GetDefaultMarca, GetDefaultCategoria };
