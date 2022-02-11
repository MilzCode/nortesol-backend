const validarArchivoSubir = (req, res, next) => {
	if (!req.files || Object.keys(req.files).length === 0) {
		res.status(400).json({ msg: 'No hay archivo subir - validarArchivoSubir' });
		return;
	}
	next();
};

/**
 * validarExtensiones recibe las extensiones a validar por parametro,
 * y tambien valida que este algun archivo en la request.
 * Si no incluye ninguna extension por defecto revisara: ('jpg', 'jpeg', 'png', 'gif').
 * Si todo sale bien almacena en la request req.validFiles, un array con los archivos.
 *
 */
const validarExtensiones = (...extensiones) => {
	return async (req, res = response, next) => {
		console.log('Validar extension...');
		if (!req.files || Object.keys(req.files).length === 0) {
			res
				.status(400)
				.json({ msg: 'No hay archivo subir - validarExtensiones' });
			return;
		}
		extensiones = extensiones ? extensiones : ['jpg', 'jpeg', 'png', 'gif'];
		let archivos = await req.files['files[]'];
		const errors = [];
		//esta tonteria es porque si viene un solo un archivo no llega como array entonces lo convertimos en array parae se caso
		if (!(archivos.length > 1)) {
			archivos = [archivos];
		}
		archivos.forEach((archivo) => {
			const extension = archivo.name.split('.').pop();
			if (!extensiones.includes(extension)) {
				errors.push(archivo.name);
			}
		});
		if (errors.length > 0) {
			return res.status(400).json({
				msg: 'Extensiones no validas: ' + errors.join(', '),
				msg2: 'Extensiones Validas: ' + extensiones.join(', '),
			});
		}

		req.validFiles = archivos;
		next();
	};
};

module.exports = { validarArchivoSubir, validarExtensiones };
