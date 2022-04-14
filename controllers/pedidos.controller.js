const { response } = require('express');

const Pedido = require('../models/pedido');

/**
 * Este metodo recibe:
 * params:
 * - idUsuario: id del usuario
 * query:
 * - page: numero de pagina
 * - limit: numero de elementos por pagina
 * - sort_query: string -> ordenar los pedidos por algun ordenamiento especifico (utiliza sort de mongoose)
 */
const pedidosUsuarioId = async (req, res = response) => {
	try {
		const usuario = req.usuarioAuth;

		const page = Number(req.query.page) || 1;
		const limit = Math.min(Number(req.query.limit), 30) || 3;
		let optionsPagination = {
			page: page,
			limit: limit,
			sort: { date: -1 },
		};
		const pedidos = await Pedido.paginate(
			{
				// $or: [{ usuario: usuario._id }, { usuario_email: usuario.email }],
				usuario_email: usuario.email,
			},
			optionsPagination
		);

		res.json({
			ok: true,
			pedidos,
		});
	} catch (error) {
		console.log({ error });
		res.status(500).json({
			ok: false,
			msg: 'Error inesperado al buscar pedidos, consulte con el administrador',
		});
	}
};

const buscarPedido = async (req, res = response) => {
	try {
		let {
			fecha_max,
			fecha_min,
			id_pay,
			//recibido posibles valores: 'yes', 'no', 'all'
			recibido = 'all',
			//status posibles valores: 'approved', 'other', 'all'
			status = 'all',
			total,
			total_max,
			total_min,
			usuario_email,
			usuario_email_cuenta_mp,
			sortQuery,
		} = req.query;

		//@creando filtro
		let filters = {};
		if (fecha_max || fecha_min) {
			filters.date = {};
			if (fecha_max) {
				filters.date.$lte = new Date(fecha_max);
			}
			if (fecha_min) {
				filters.date.$gte = new Date(fecha_min);
			}
		}

		if (id_pay) {
			filters.id_pay = id_pay.trim();
		}
		if (recibido === 'yes') {
			filters.recibido = recibido;
		} else if (recibido === 'no') {
			filters.recibido = false;
		}

		if (status === 'approved') {
			filters.status = 'approved';
		} else if (status == 'noapproved') {
			filters.status = { $ne: 'approved' };
		}

		if (total) {
			filters.total = total;
		}
		if (total_max || total_min) {
			filters.total = {};
			if (total_max) {
				filters.total.$lte = total_max;
			}
			if (total_min) {
				filters.total.$gte = total_min;
			}
		}

		if (usuario_email) {
			filters.usuario_email = usuario_email.trim().toLowerCase();
		}
		if (usuario_email_cuenta_mp) {
			filters.usuario_email_cuenta_mp = usuario_email_cuenta_mp
				.trim()
				.toLowerCase();
		}

		//@fin creando filtro
		const page = Number(req.query.page) || 1;
		const limit = Math.min(Number(req.query.limit), 99) || 50;
		let optionsPagination = {
			page: page,
			limit: limit,
			sort: { date: -1 },
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
		const pedidos = await Pedido.paginate(filters, optionsPagination);

		return res.json({ ok: true, pedidos });
	} catch (error) {
		console.log({ error });
		return res.status(500).json({
			ok: false,
			msg: 'Error inesperado al buscar pedido, consulte con el administrador',
		});
	}
};

const entregarPedido = async (req, res = response) => {
	try {
		const { idpedido } = req.params;
		const pedido = await Pedido.findOne({ id_pay: idpedido });

		if (!pedido) {
			return res.status(404).json({
				ok: false,
				msg: 'El pedido no existe',
			});
		}
		pedido.recibido = true;
		await pedido.save();
		res.json({
			ok: true,
			msg: 'Pedido actualizado',
		});
	} catch (error) {
		console.log({ error });
		res.status(500).json({
			ok: false,
			msg: 'Error inesperado al buscar pedido, consulte con el administrador',
		});
	}
};
module.exports = {
	pedidosUsuarioId,
	buscarPedido,
	entregarPedido,
};
