// const admin = require('firebase-admin');
//en caso de que se desee usar firebase en el futuro solo basta con dejar el archivo de configuracion .json junto a este archivo
//como en el ejemplo que se ve abajo
// admin.initializeApp({
// 	credential: admin.credential.cert(
// 		require('./nortesol-a640d-firebase-adminsdk-bwqa9-7322f93023.json')
// 	),
// });


/*
Con esta variable tambien podemos validar tokens de firebase
const decodeValue = await admin.auth().verifyIdToken(token);
console.log('decodeValue: ', decodeValue);
*/

// module.exports = admin;
