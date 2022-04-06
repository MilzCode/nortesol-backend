const Historial = require('../models/historial');

const NewHistory = ({ tipo, usuario, detalle }) => {
	try {
		console.log(usuario);
		let { _id, email } = usuario;
		if (!_id || !email) {
			console.log('Error al crear historial, no se encontró usuario');
			_id = '5e63c3a5e4232e4cd0274ac2';
			email = 'Usuario no encontrado';
		}
		const newHistory = new Historial({
			tipo,
			usuario: _id,
			usuario_name: email,
			detalle,
		});
		newHistory.save();
	} catch (error) {
		console.log(error);
		console.log('Error al guardar historial!!');
	}
};

module.exports = { NewHistory };
