const Categoria = require("../models/categoria");

/**
 * El siguiente metodo recibe un arreglo de string de categorias y retorna un objeto con:
 * 1. si todas las categorias son validas:
 * {
 *  ok: true,
 *  categorias: [categoria1, categoria2, ...] //todas las categorias validas
 * }
 * 2. si alguna categoria no es valida:
 * {
 *     ok: false,
 *     categorias: [nombre categoria1, nombre categoria2, ...] //nombre de las categorias no encontradas
 *     msg: mensaje de error
 * }
 *
 * @param categorias : arreglo de string de nombres de categorias
 * @param maxCategorias : cantidad maxima de categorias permitidas
 *
 **/
const buscarCategoriasValidas = async (categorias = [], maxCategorias = 4) => {
  try {
    if (categorias.length <= 0) {
      return {
        ok: false,
        msg: "No se ha ingresado ninguna categoria",
        categorias: [],
      };
    } else if (categorias.length > maxCategorias) {
      return {
        ok: false,
        msg: `Se ha ingresado mas de ${maxCategorias} categorias`,
        categorias: [],
      };
    }
    const buscarCategorias = await Promise.all(
      categorias.map((categ) =>
        Categoria.findOne({ nombre: categ.toLowerCase() })
      )
    );
    const categoriasEncontradas = buscarCategorias.filter((categ) => !!categ);
    const hayCategoriasNoEncontradas = buscarCategorias.some(
      (categoria) => categoria === null
    );

    if (hayCategoriasNoEncontradas) {
      const nombreCategoriasEncontradas = categoriasEncontradas.map(
        (categ) => categ.nombre
      );
      const nombreCategoriasNoEncontradas = categorias.filter(
        (categoria) =>
          !nombreCategoriasEncontradas.includes(categoria.toLowerCase())
      );
      return {
        ok: false,
        categorias: nombreCategoriasNoEncontradas,
      };
    }
    return {
      ok: true,
      categorias: categoriasEncontradas,
    };
  } catch (error) {
    console.log(error);
    return {
      ok: false,
      msg: "Error al intentar buscar categorias, ¿ha ingresado un tipo de dato no valido?",
      categorias: [],
    };
  }
};

module.exports = buscarCategoriasValidas;
