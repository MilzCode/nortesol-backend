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
 * LOS ARCHIVOS DEBEN MANDARSE COMO FILES!
 * @param {skip,valid} props
 * : skip = true en caso de no existir archivo no validar y req.validFiles = false;
 * : skip = false en caso de existir archivo validar  y req.validFiles = array de archivos;
 * : valid = array con extensiones validas
 */

const validarExtensiones = (props) => {
	let { valid, skip } = props;
	return async (req, res = response, next) => {
		try {
			// console.log('Validar extension...');
			if (!req.files || Object.keys(req.files).length === 0) {
				if (skip) {
					req.validFiles = false;
					return next();
				}
				return res
					.status(400)
					.json({ msg: 'No hay archivo subir - validarExtensiones' });
			}
			valid = valid ? valid : ['jpg', 'jpeg', 'png', 'gif'];
			let archivos = await req.files['files[]'];
			const errors = [];
			//esta tonteria es porque si viene un solo un archivo no llega como array entonces lo convertimos en array parae se caso
			if (!(archivos.length > 1)) {
				archivos = [archivos];
			}
			archivos.forEach((archivo) => {
				const extension = archivo.name.split('.').pop();
				if (!valid.includes(extension)) {
					errors.push(archivo.name);
				}
			});
			if (errors.length > 0) {
				return res.status(400).json({
					msg: 'Extensiones no validas: ' + errors.join(', '),
					msg2: 'Extensiones Validas: ' + valid.join(', '),
				});
			}

			req.validFiles = archivos;
			next();
		} catch (error) {
			console.log(error);
			return res.status(500).json({
				ok: false,
				msg: 'Error validando extensiones, contacte al administrador',
			});
		}
	};
};

module.exports = { validarArchivoSubir, validarExtensiones };
