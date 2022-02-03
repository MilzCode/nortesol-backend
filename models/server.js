const express = require("express");
const cors = require("cors");
const { dbConnection } = require("../database/configMongoose");

class Server {
  constructor() {
    this.app = express();
    this.port = process.env.PORT;
    this.rutas = {
      auth: "/api/auth",
      usuarios: "/api/usuarios",
      productos: "/api/productos",
      categorias: "/api/categorias",
      pedidos: "/api/pedidos",
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
  }

  routes() {
    this.app.use(this.rutas.auth, require("../routes/auth.route"));
    this.app.use(this.rutas.usuarios, require("../routes/usuarios.route"));
    this.app.use(this.rutas.productos, require("../routes/productos.route"));
    this.app.use(this.rutas.categorias, require("../routes/categorias.route"));
    this.app.use(this.rutas.pedidos, require("../routes/pedidos.route"));
  }

  listen() {
    this.app.listen(this.port, () => {
      console.log(`Servidor corriendo en puerto ${this.port}`);
    });
  }
}

module.exports = Server;
