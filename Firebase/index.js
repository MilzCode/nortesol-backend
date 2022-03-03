const admin = require('firebase-admin');

admin.initializeApp({
	credential: admin.credential.cert(
		require('./nortesol-a640d-firebase-adminsdk-bwqa9-7322f93023.json')
	),
});

module.exports = admin;
