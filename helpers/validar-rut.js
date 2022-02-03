const formatoRut = require("../utils/formato-rut");

var Fn = {
  // Valida el rut con su cadena completa "XXXXXXXX-X"
  validaRut: function (rutCompleto) {
    if (!/^[0-9]+[-|‐]{1}[0-9kK]{1}$/.test(rutCompleto)) return false;
    var tmp = rutCompleto.split("-");
    var digv = tmp[1];
    var rut = tmp[0];
    if (digv == "K") digv = "k";
    return Fn.dv(rut) == digv;
  },
  dv: function (T) {
    var M = 0,
      S = 1;
    for (; T; T = Math.floor(T / 10)) S = (S + (T % 10) * (9 - (M++ % 6))) % 11;
    return S ? S - 1 : "k";
  },
};

/**
 * Esta funcion valida un rut en el formato "XXXXXXXX-X"
 * @param {string} rut rut a validar
 * **/
const validarRut = (rut) => {
  let rutValido = false;
  if (rut && rut.length > 0) {
    rutValido = Fn.validaRut(formatoRut(rut));
  }
  if (!rutValido) {
    throw new Error("Rut no valido: " + rut);
  }
  return true;
};

module.exports = { validarRut };
