const { response } = require('express');
const { ObjectId } = require('mongoose').Types;

const Pedido = require('../models/pedido');
const Usuario = require('../models/usuario');
const buscarProductosValidos = require('../utils/buscar-productos-validos');

/**
 *
 * buscarPedido recibe:
 * params:
 * - idoemail: id o email del usuario segun sea el caso
 * en el caso de que sea un id, se entrega directamente el pedido
 * en caso de que sea email se entregara paginado todos los pedidos
 * query:
 * - pagado: true/false -> devuelve todos los pedidos pagados o no pagados, (se puede concatenar con params)
 * - page: numero de pagina -> devuelve los pedidos de la pagina indicada [solo funciona para busquedas sin params (sin /idoemail)]
 * body:
 * - query_sort: string -> ordenar los pedidos por algun ordenamiento especifico (utiliza sort de mongoose) [solo funciona para busquedas sin params (sin /idoemail)]
 */
const buscarPedido = async (req, res = response) => {
	try {
		let pedidos = null;
		const page = Number(req.query.page) || 1;

		const limit = Math.min(Number(req.query.limit), 30) || 10;
		let optionsPagination = {
			page: page,
			limit: limit,
			sort: { date: -1 },
		};

		//
		const pagado = req.query.pagado ? req.query.pagado === 'true' : null;
		const idoemail = req.params.idoemail;
		//BUSQUEDAS POR PARAMS
		if (idoemail) {
			const isMongID = ObjectId.isValid(idoemail);
			if (isMongID) {
				const id = idoemail;
				pedidos = await Pedido.findById(id);
				//filtramos el pedido en caso de que se busque que tambien este pagado o no
				//si pagado === null entonces es como si no pasara nada
				//si pagado !== pedidos.pagado entonces no se muestra

				pedidos =
					pagado === null || pedidos.pagado === pagado ? [pedidos] : null;
			} else {
				const email = new RegExp(idoemail, 'i');

				//filtramos el pedido en caso de que se busque que tambien este pagado o no
				let queryFind = pagado === null ? {} : { pagado };
				// const usuario = await Usuario.findOne({ email }).populate({
				//   path: "pedidos",
				//   match: queryFind,
				// });

				// if (!usuario || usuario.pedidos.length === 0) {
				//   return res.json({
				//     ok: true,
				//     pedidos: [],
				//   });
				// }

				// pedidos = usuario.pedidos;

				const usuario = await Usuario.findOne({ email });
				if (!usuario) {
					return res.json({
						ok: true,
						pedidos: [],
					});
				}
				const idUsuario = usuario._id;
				pedidos = await Pedido.paginate(
					{ usuario: idUsuario, ...queryFind },
					optionsPagination
				);
			}
			if (!pedidos) {
				return res.json({
					ok: true,
					pedidos: [],
				});
			}
			return res.json({
				ok: true,
				pedidos,
			});
		}
		//BUSQUEDAS POR QUERY

		if (pagado !== null) {
			pedidos = await Pedido.paginate({ pagado }, optionsPagination);
		} else {
			pedidos = await Pedido.paginate({}, optionsPagination);
		}
		if (pedidos) {
			return res.json({
				ok: true,
				pedidos,
			});
		}
		return res.json({
			ok: true,
			pedidos: [],
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			ok: false,
			msg: 'Error inesperado al buscar pedido, consulte con el administrador',
		});
	}
};

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
		res.status(500).json({
			ok: false,
			msg: 'Error inesperado al buscar pedidos, consulte con el administrador',
		});
	}
};

module.exports = {
	buscarPedido,
	pedidosUsuarioId,
};
