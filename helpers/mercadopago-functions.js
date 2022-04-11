const { default: axios } = require('axios');
const PaymentLog = require('../models/payment_log');

const GetPaymentData = async (payment_id) => {
	try {
		const resp = await axios.get(
			'https://api.mercadopago.com/v1/payments/' + payment_id,
			{
				headers: {
					'Content-Type': 'application/json',
					Authorization: 'Bearer ' + process.env.ACCESS_TOKEN_MERCADOPAGO,
				},
			}
		);
		return resp.data;
	} catch (error) {
		return null;
	}
};

const NewPaymentLog = async ({
	id_pay,
	usuario_email,
	usuario_email_cuenta_mp,
	date_mp,
}) => {
	try {
		if (!usuario_email) {
			console.log('Error al crear Log de payment, no se encontró usuario');
		}
		const newPayment = await new PaymentLog({
			id_pay,
			usuario_email,
			usuario_email_cuenta_mp,
			date_mp,
		});
		await newPayment.save();
		return true;
	} catch (error) {
		console.log(error);
		console.log('Error al guardar Log de payment!!');
		return false;
	}
};

module.exports = { GetPaymentData, NewPaymentLog };
