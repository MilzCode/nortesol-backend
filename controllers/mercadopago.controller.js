const { default: axios } = require('axios');
const Producto = require('../models/producto');
const Usuario = require('../models/usuario');

const nuevoPago = async (req, res) => {
	const API_MERCADOPAGO_CHECKOUT =
		'https://api.mercadopago.com/checkout/preferences?access_token=' +
		process.env.ACCESS_TOKEN_MERCADOPAGO;
	try {
		const {
			productosAndQty = [], // [{p: producto pid, c: cantidad},...]
			external_reference,
		} = req.body;

		/* 
        TODO:
        - Pueden ser varios productos.
        - No se puede hacer un pago con un precio mayor o menor al del producto.+
        - No se puede hacer un pago con una cantidad mayor o menor al del producto.+
        - No se puede hacer un pago con una cantidad menor a 1.+
        - el email debe ser el mismo que el del usuario que hace el pago. ?
        - quantity * unit_price = precio_productoBD * quantity ?

       */
		const usuario = req.usuarioAuth;
		const email = usuario.email;

		if (productosAndQty.length === 0) {
			return res.status(400).json({
				ok: false,
				message: 'No hay productos para comprar.',
			});
		}

		const productos = await Producto.find({
			pid: { $in: productosAndQty.map((p) => p.p) },
		}).select('pid precio cantidad nombre');

		if (productos.length !== productosAndQty.length) {
			return res.status(400).json({
				ok: false,
				message: 'Algunos productos no encontrados.',
			});
		}
		productos.forEach((p) => {
			const { pid, cantidad } = p;
			const { c } = productosAndQty.find((pq) => pq.p === pid);
			if (c > cantidad) {
				return res.status(400).json({
					ok: false,
					message: 'Algunos productos no tienen suficiente cantidad.',
				});
			}
		});
		const items = productos.map((p) => {
			const { pid, precio, nombre } = p;
			const { c } = productosAndQty.find((pq) => pq.p === pid);
			return {
				id: pid,
				title: nombre,
				quantity: c,
				unit_price: precio,
				description: nombre + ' x ' + c,
			};
		});
		const payer = {
			// email,
			email: 'test_user_51992233@testuser.com',
		};
		const preference = {
			items,
			payer,
			payment_methods: {
				excluded_payment_methods: [
					{
						id: 'amex',
					},
				],
				excluded_payment_types: [
					{
						id: 'ticket',
						id: 'atm',
					},
				],
			},
			back_urls: {
				success: 'http://localhost:3001',
				failure: 'http://localhost:3001',
				pending: 'http://localhost:3001',
			},
			auto_return: 'approved',
			binary_mode: true,
		};
		const respMp = (
			await axios.post(API_MERCADOPAGO_CHECKOUT, preference, {
				// headers: {
				// 	'x-integrator-id': integrator_id,
				// },
			})
		).data;
		const id = respMp.id;
		const init_point = respMp.init_point;

		return res.json({ ok: true, id, init_point });
	} catch (error) {
		console.log(error);
		return res.json({ ok: false, msg: 'Error al crear preferencia de pago.' });
	}
};

const webhookPagoCreado = async (req, res) => {
	try {
		const { type } = req.query;
		if (type) {
			const notification = new NotificationsControl();
			let notificacionReq = req.body;
			if (notificacionReq && notificacionReq.action === 'payment.created') {
				notification.guardarDB({ element: notificacionReq });
			}
		}
		return res.json({ ok: true });
	} catch (error) {
		console.log(error);
		return res
			.status(500)
			.json({ ok: false, msg: 'Error al recibir notificación.' });
	}
};
module.exports = {
	nuevoPago,
};
