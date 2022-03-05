/*

	Si algunas de estas constantes cambia, seria recomendable que se cambia la version de cada documento que utilice diche constante,
	y cambiar la funcionaliodad segun la version.
	ya que es posible que al cambiar un valor esta ya no sea compatible para otros documentos.
	por ejemplo en MAXIMAGENESPORPRODUCTO
*/

const MAXIMAGENESPORPRODUCTO = 2;
const MAXCATEGORIASPORPRODUCTO = 3;
const MINCARACTERESCONTRASENA = 6;
//Algunos nombres como "cuadernozaza" pueden coincidir con un mongo id valido, esta llave es para verificar que es un string y no un mongo id.
const NOMONGOIDKEY_DONOTCHANGE = 'NAME---';
const SEPARADOR = '&:::';
const MAXPRODUCTOSCARRITO = 30;
const MAXPORTADAS = 5;
const MAXANUNCIOS = 1;

//FILTER SEARCH OPTIONS
const MAXCATEGORIASFILTER = 3;
const MAXMARCASFILTER = 3;
const PRECIOMINFILTER = 0;
const PRECIOMAXFILTER = 1000000;
const MAXTEXTBUSQUEDAFILTER = 20;

const ROLES = ['ADMIN', 'USER']; //esta variable no se enlaza con la base de datos.

module.exports = {
	MAXIMAGENESPORPRODUCTO,
	MAXCATEGORIASPORPRODUCTO,
	MINCARACTERESCONTRASENA,
	ROLES,
	NOMONGOIDKEY_DONOTCHANGE,
	SEPARADOR,
	MAXPRODUCTOSCARRITO,
	PRECIOMINFILTER,
	PRECIOMAXFILTER,
	MAXCATEGORIASFILTER,
	MAXMARCASFILTER,
	MAXPORTADAS,
	MAXANUNCIOS,
	MAXTEXTBUSQUEDAFILTER,
};
