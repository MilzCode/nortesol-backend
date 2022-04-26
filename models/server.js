const express = require('express');
const cors = require('cors');
const { dbConnection } = require('../database/configMongoose');
const fileUpload = require('express-fileupload');

class Server {
	constructor() {
		this.app = express();
		this.port = process.env.PORT;
		this.rutas = {
			auth: '/api/auth',
			usuarios: '/api/usuarios',
			productos: '/api/productos',
			productos_desabilitados: '/api/productos_desabilitados',
			categorias: '/api/categorias',
			pedidos: '/api/pedidos',
			configs: '/api/configs',
			images: '/api/images',
			marcas: '/api/marcas',
			portadas: '/api/portadas',
			anuncios: '/api/anuncios',
			historial: '/api/historial',
			multiples: '/api/multiples',
			mercadopago: '/api/mercadopago',
		};
		this.connectDb();
		this.middlewares();
		this.routes();
	}
	async connectDb() {
		await dbConnection();
	}
	middlewares() {
		//CORS
		const whiteList = [process.env.FRONT_URL, process.env.FRONT_URL_ADM];
		// this.app.use(
		// 	cors({
		// 		origin: (origin, callback) => {
		// 			if (whiteList.indexOf(origin) !== -1) {
		// 				callback(null, true);
		// 			} else {
		// 				callback(new Error('Not allowed by CORS'));
		// 			}
		// 		},
		// 	})
		// );
		this.app.use((req, res, next) => {
			console.log({ svkey: req.headers.origin_sv });
			cors({
				origin: (origin, callback) => {
					if (
						whiteList.indexOf(origin) !== -1 ||
						(process.env.ORIGIN_SV_KEY &&
							process.env.ORIGIN_SV_KEY == req.headers.origin_sv)
					) {
						callback(null, true);
					} else {
						callback(new Error('Not allowed by CORS'));
					}
				},
			})(req, res, next);
		});

		//Lectura y parseo body
		this.app.use(express.json());
		// parse application/x-www-form-urlencoded
		// this.app.use(express.urlencoded({ extended: false }));
		// File Upload
		this.app.use(
			fileUpload({
				useTempFiles: true,
				tempFileDir: '/tmp/',
				//permite subir archivos y crear la carpeta si es necesario
				// createParentPath: true,
			})
		);
	}

	routes() {
		this.app.use(this.rutas.auth, require('../routes/auth.route'));
		this.app.use(this.rutas.usuarios, require('../routes/usuarios.route'));
		this.app.use(this.rutas.productos, require('../routes/productos.route'));
		this.app.use(this.rutas.categorias, require('../routes/categorias.route'));
		this.app.use(this.rutas.pedidos, require('../routes/pedidos.route'));
		this.app.use(this.rutas.images, require('../routes/images.route'));
		this.app.use(this.rutas.marcas, require('../routes/marcas.route'));
		this.app.use(this.rutas.portadas, require('../routes/portadas.route'));
		this.app.use(this.rutas.anuncios, require('../routes/anuncios.route'));
		this.app.use(this.rutas.historial, require('../routes/historial.route'));
		this.app.use(this.rutas.multiples, require('../routes/multiples.route'));
		this.app.use(
			this.rutas.mercadopago,
			require('../routes/mercadopago.route')
		);
		this.app.use(this.rutas.configs, require('../routes/configs.route'));
		this.app.use(
			this.rutas.productos_desabilitados,
			require('../routes/productos_desabilitados.route')
		);
	}

	listen() {
		this.app.listen(this.port, () => {
			console.log(`Servidor corriendo en puerto ${this.port}`);
		});
	}
}

module.exports = Server;
