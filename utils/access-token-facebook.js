const { default: axios } = require('axios');

const GetAccessTokenFacebook = async () => {
	try {
		const url = 'https://graph.facebook.com/oauth/access_token';
		const params = {
			client_id: process.env.FACEBOOK_ID,
			client_secret: process.env.FACEBOOK_SECRET,
			grant_type: 'client_credentials',
		};
		const response = await axios.get(url, { params });
		return response.data.access_token ?? null;
	} catch (error) {
		return null;
	}
	return null;
};

module.exports = GetAccessTokenFacebook;
