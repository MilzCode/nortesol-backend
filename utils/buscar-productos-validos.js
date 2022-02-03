const Producto = require("../models/producto");
const { ObjectId } = require("mongoose").Types;
/**
 * El siguiente metodo recibe un arreglo de objeto con {cantidad: NUMBER, producto: idProducto<string>} de ids productos
 * y retorna si objeto donde se le añade el nombre si todos los productos son validos, false y msg si alguno no es valido
 **/
const buscarProductosValidos = async (productosIdsCantidad = []) => {
  try {
    if (productosIdsCantidad.length <= 0) {
      return {
        ok: false,
        msg: "No se ha ingresado ningun producto",
      };
    }
    let productosEncontrados = [];
    let productosNovalidos = [];
    let productosSinStock = [];
    let prodDuplicados = [];
    let totalTodosProductos = 0;
    let peticionProductoDuplicado = false;
    const productosListos = await Promise.all(
      productosIdsCantidad.map(async (prod) => {
        const productoEncontrado = await Producto.findById(
          new ObjectId(prod.producto)
        );

        if (!productoEncontrado) {
          productosNovalidos.push(prod.producto);
          return prod;
        }
        if (productoEncontrado && prod.cantidad > productoEncontrado.cantidad) {
          productosSinStock.push(prod.producto);
          return prod;
        }
        if (
          productoEncontrado &&
          productosEncontrados.includes(productoEncontrado.nombre)
        ) {
          peticionProductoDuplicado = true;
          prodDuplicados.push(productoEncontrado.nombre);
          return prod;
        }
        if (productoEncontrado) {
          productosEncontrados.push(productoEncontrado.nombre);
        }

        prod.total = productoEncontrado.precio * prod.cantidad;
        totalTodosProductos += prod.total;
        prod.nombre = productoEncontrado.nombre;
        prod.producto = productoEncontrado._id;
        return prod;
      })
    );
    const productoNoValido = productosListos.some((prod) => !prod.nombre);

    if (productoNoValido) {
      let msg = "";
      let sinStock = undefined;
      let noValidos = undefined;
      let duplicados = undefined;

      if (productosNovalidos.length > 0) {
        msg = "- Hay productos no validos.";
        noValidos = productosNovalidos;
      }
      if (productosSinStock.length > 0) {
        msg += "- Hay productos sin stock.";
        sinStock = productosSinStock;
      }
      if (peticionProductoDuplicado) {
        msg += "- La peticion contiene productos duplicados.";
        duplicados = prodDuplicados;
      }

      return {
        ok: false,
        msg,
        sinStock,
        noValidos,
        duplicados,
      };
    }
    return {
      ok: true,
      productos: productosListos,
      totales: totalTodosProductos,
    };
  } catch (error) {
    console.log(error);
    return {
      ok: false,
      msg: "Error al buscar productos, ¿ha ingresado un id de producto valido?",
    };
  }
};

module.exports = buscarProductosValidos;
