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
			images: '/api/images',
			marcas: '/api/marcas',
			portadas: '/api/portadas',
			anuncios: '/api/anuncios',
			historial: '/api/historial',
			multiples: '/api/multiples',
			test: '/api/test',
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
		//TODO: Falta configurar cors para que solo funcione en rutas especificas, ahora cualquier ruta funciona
		this.app.use(cors());
		//Lectura y parseo body
		this.app.use(express.json());
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
			this.rutas.productos_desabilitados,
			require('../routes/productos_desabilitados.route')
		);
		this.app.use(this.rutas.test, require('../routes/test.route'));
	}

	listen() {
		this.app.listen(this.port, () => {
			console.log(`Servidor corriendo en puerto ${this.port}`);
		});
	}
}

module.exports = Server;
