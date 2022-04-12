const { default: axios } = require('axios');
const Producto = require('../models/producto');
const Pedido = require('../models/pedido');
const Usuario = require('../models/usuario');

const {
	GetPaymentData,
	NewPaymentLog,
} = require('../helpers/mercadopago-functions');

const nuevoPago = async (req, res) => {
	const API_MERCADOPAGO_CHECKOUT =
		'https://api.mercadopago.com/checkout/preferences?access_token=' +
		process.env.ACCESS_TOKEN_MERCADOPAGO;
	try {
		const {
			productosAndQty = [], // [{p: producto pid, c: cantidad},...]
			domicilio = false,
		} = req.body;

		/* 
        TODO:
        - Pueden ser varios productos.
        - No se puede hacer un pago con un precio mayor o menor al del producto.+
        - No se puede hacer un pago con una cantidad mayor o menor al del producto.+
        - No se puede hacer un pago con una cantidad menor a 1.+
		- el email debe existir.
        - el email debe ser el mismo que el del usuario que hace el pago. ?
        - quantity * unit_price = precio_productoBD * quantity ?

       */
		const usuario = req.usuarioAuth;
		const email = usuario.email;
		const ubicacion = {
			region: usuario.region,
			ciudad: usuario.ciudad,
			direccion: usuario.direccion,
		};
		const celular = usuario.celular;
		const rut = usuario.rut;
		const nombre = usuario.nombre;

		if (celular === '912345678' || rut === '00.000.000-0') {
			return res.status(400).json({
				ok: false,
				msg: 'Se necesitan datos del usuario para poder hacer un pago',
			});
		}

		if (productosAndQty.length === 0) {
			return res.status(400).json({
				ok: false,
				message: 'No hay productos para comprar.',
			});
		}

		const productos = await Producto.find({
			pid: { $in: productosAndQty.map((p) => p.p) },
		}).select('pid precio porcentaje_descuento cantidad nombre');

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
			const { pid, precio, nombre, porcentaje_descuento } = p;
			const { c } = productosAndQty.find((pq) => pq.p === pid);
			return {
				id: pid,
				title: nombre,
				quantity: c,
				unit_price: precio - precio * (porcentaje_descuento / 100),
				description: JSON.stringify({
					unit_price_original: precio,
					porcentaje_descuento,
				}),
			};
		});
		const payer = {
			// email,
			email: 'test_user_51992233@testuser.com',
		};
		const preference = {
			items,
			payer,
			external_reference: {
				email_usuario: email,
				ubicacion,
				celular,
				rut,
				domicilio,
				nombre,
			},
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
			// notification_url: 'http://localhost:3001/api/mercadopago/webhook',
			notification_url:
				'http://3049-152-172-169-75.ngrok.io/api/mercadopago/webhook',
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
		return res
			.status(500)
			.json({ ok: false, msg: 'Error al crear preferencia de pago.' });
	}
};

const webhookPagoCreado = async (req, res) => {
	try {
		const { type } = req.query;
		if (type) {
			let notificacionReq = req.body;
			if (notificacionReq && notificacionReq.action === 'payment.created') {
				const id_pay = notificacionReq.data.id;
				const paymentData = await GetPaymentData(id_pay);
				if (!paymentData) {
					const dateNow = new Date();
					console.log(
						'No se pudo crear el log de pago. Date: ',
						dateNow,
						'. id_pay: ',
						id_pay
					);
					return res.status(500).json({
						ok: false,
						message: 'No se pudo obtener los datos del pago.',
					});
				}
				const external_reference = JSON.parse(paymentData.external_reference);
				const usuario_email = external_reference.email_usuario;
				const usuario_email_cuenta_mp = paymentData.payer.email;
				const date_mp = paymentData.date_created;
				const payLogCreated = await NewPaymentLog({
					id_pay,
					usuario_email,
					usuario_email_cuenta_mp,
					date_mp,
				});
				if (!payLogCreated) {
					console.log('No se pudo crear el log de pago.*****');
					return res.status(500).json({
						ok: false,
						message: 'No se pudo crear el log de pago.',
					});
				}
				//si el payment.status es approved creamos el pedido de inmediato
				if (paymentData.status === 'approved') {
					const external_reference = JSON.parse(paymentData.external_reference);
					const usuario_email = external_reference.email_usuario;
					const usuario_email_cuenta_mp = paymentData.payer.email;
					const usuario_celular = external_reference.celular;
					const usuario_rut = external_reference.rut;
					const usuario_nombre = external_reference.nombre;
					const domicilio = external_reference.domicilio;

					const usuario = await Usuario.findOne({ email: usuario_email });
					const usuario_id = usuario ? usuario._id : null;

					const ubicacion = external_reference.ubicacion;
					const date_mp = paymentData.date_created;
					const items_mp = paymentData.additional_info.items;
					const total = paymentData.transaction_amount;

					const items = items_mp.map((item) => {
						return {
							quantity: item.quantity,
							pid: item.id,
							unit_price: item.unit_price,
							title: item.title,
							total_this: item.quantity * item.unit_price,
							description: JSON.parse(item.description),
						};
					});

					const newPedido = await Pedido({
						usuario: usuario_id,
						usuario_email,
						usuario_email_cuenta_mp,
						usuario_celular,
						usuario_rut,
						domicilio,
						id_pay,
						date_mp,
						status: paymentData.status,
						ubicacion,
						items,
						total,
						usuario_nombre,
					});
					await newPedido.save();
				}
			} else if (
				notificacionReq &&
				notificacionReq.action === 'payment.updated'
			) {
				//TODO: Save payment_id and status
				const id_pay = notificacionReq.data.id;
				const paymentData = await GetPaymentData(id_pay);
				//find pedido if exist update status if status is approved, else create new pedido
				if (!paymentData) {
					console.log('No se pudo obtener los datos del pago.*****');

					return res.status(500).json({
						ok: false,
						message: 'No se pudo obtener los datos del pago.',
					});
				}

				const pedidoExist = await Pedido.findOne({
					id_pay,
				});

				if (pedidoExist && pedidoExist.status === 'approved') {
					if (paymentData.status !== 'approved') {
						pedidoExist.status = paymentData.status;
						const pedidoUpdated = await pedidoExist.save();
						if (!pedidoUpdated) {
							const dateNow = new Date();

							console.log(
								'No se pudo actualizar el pedido. Id_pay: ',
								id_pay,
								'. Date: ',
								dateNow
							);
							return res.status(500).json({
								ok: false,
								message: 'No se pudo actualizar el pedido.',
							});
						} else {
							console.log('Se actualizo el pedido con el id: ' + id_pay);
							return res.json({
								ok: true,
								message: 'Se actualizo el pedido.',
							});
						}
					}
				} else if (paymentData.status === 'approved') {
					const external_reference = JSON.parse(paymentData.external_reference);
					const usuario_email = external_reference.email_usuario;
					const usuario_email_cuenta_mp = paymentData.payer.email;
					const usuario_celular = external_reference.celular;
					const usuario_rut = external_reference.rut;
					const usuario_nombre = external_reference.nombre;
					const domicilio = external_reference.domicilio;

					const usuario = await Usuario.findOne({ email: usuario_email });
					const usuario_id = usuario ? usuario._id : null;

					const ubicacion = external_reference.ubicacion;
					const date_mp = paymentData.date_created;
					const items_mp = paymentData.additional_info.items;
					const total = paymentData.transaction_amount;

					const items = items_mp.map((item) => {
						return {
							quantity: item.quantity,
							pid: item.id,
							unit_price: item.unit_price,
							title: item.title,
							total_this: item.quantity * item.unit_price,
							description: JSON.parse(item.description),
						};
					});

					const newPedido = await Pedido({
						usuario: usuario_id,
						usuario_email,
						usuario_email_cuenta_mp,
						usuario_celular,
						usuario_rut,
						domicilio,
						id_pay,
						date_mp,
						status: paymentData.status,
						ubicacion,
						items,
						total,
						usuario_nombre,
					});
					await newPedido.save();
				}
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
	webhookPagoCreado,
};
