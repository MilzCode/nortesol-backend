const { response } = require("express");

const tieneRol = (...roles) => {
  return (req, res = response, next) => {
    if (!req.usuarioAuth) {
      return res.status(401).json({
        ok: false,
        msg: "No hay usuario autenticado",
      });
    }
    if (!roles.includes(req.usuarioAuth.rol)) {
      return res.status(401).json({
        ok: false,
        msg: "No tiene permisos para realizar esta accion.",
      });
    }
    next();
  };
};

module.exports = {
  tieneRol,
};
