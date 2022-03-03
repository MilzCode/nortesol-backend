const { OAuth2Client } = require('google-auth-library');

const googleVerify = async (token = '') => {
	try {
		const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
		const ticket = await client.verifyIdToken({
			idToken: token,
			audience: process.env.GOOGLE_CLIENT_ID,
		});

		console.log(ticket.getPayload());
		const { name, picture, email, email_verified } = ticket.getPayload();
		return { nombre: name, img: picture, correo: email, email_verified };
	} catch (error) {
		return null;
	}
};

module.exports = googleVerify;
