const MAXIMAGENESPORPRODUCTO = 5;
const MAXCATEGORIASPORPRODUCTO = 3;
const MINCARACTERESCONTRASENA = 6;
//Algunos nombres como "cuadernozaza" pueden coincidir con un mongo id valido, esta llave es para verificar que es un string y no un mongo id.
const NOMONGOIDKEY_DONOTCHANGE = 'NAME---';

const ROLES = ['ADMIN', 'USER']; //esta variable no se enlaza con la base de datos.

module.exports = {
	MAXIMAGENESPORPRODUCTO,
	MAXCATEGORIASPORPRODUCTO,
	MINCARACTERESCONTRASENA,
	ROLES,
	NOMONGOIDKEY_DONOTCHANGE,
};
