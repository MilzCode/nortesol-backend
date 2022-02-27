const Historial = require('../models/historial');

const verHistorial = async (req, res) => {
	let { sortQuery } = req.query;
	try {
		const page = Number(req.query.page) || 1;
		let optionsPagination = {
			page: page,
			limit: 25,
			sort: { fecha: -1 },
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
		const historial = await Historial.paginate({}, optionsPagination);
		return res.json({
			ok: true,
			historial,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			ok: false,
			msg:
				'Error inesperado al mostrar historial, consulte con el administrador',
		});
	}
};

module.exports = {
	verHistorial,
};
