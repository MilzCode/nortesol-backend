/**
 * Este metodo se utiliza para almacenar la url de un producto en la base de datos.
 * No modificar si existen productos en la base de datos, ya que estos se generan al momento de crear un producto.
 * O en cuyo caso se debera modificar todos los apartados correspondientes en la base de datos
 */

const urlStyle = (str) => {
	str = str.trim();
	str = str.toLowerCase();
	str = str.replace(/[áàâãäå]/g, 'a');
	str = str.replace(/[éèêë]/g, 'e');
	str = str.replace(/[íìîï]/g, 'i');
	str = str.replace(/[óòôõö]/g, 'o');
	str = str.replace(/[úùûü]/g, 'u');
	str = str.replace(/[ç]/g, 'c');
	str = str.replace(/[ñ]/g, 'n');
	//caracteres que no coincidan con alphanumerico se convierten en "-" (incluidos espacios)
	str = str.replace(/[^a-z0-9]/g, '-');
	return str;
};


module.exports = {
  urlStyle
}