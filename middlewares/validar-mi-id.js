/**
 * Este metodo funciona en conjunto con el middleware validar-jwt.js (validar-jwt.js debe cargarse antes).
 * Verifica que el usuario que esta en el jwt valido sea el mismo que el usuario que esta en la url.
 * metodo:
 * -idName = nombre del parametro que se encuentra en la url.
 * -admin = true/false -> si es true el admin puede acceder.
 * recibe por param:
 * -id: id del usuario que se quiere verificar
 * recibe por request.
 * -usuarioAuth: usuario que esta en el jwt valido.
 */

const estMiIdBody = (idName = "id", ...rolesPermitidos) => {
  return (req, res = response, next) => {
    if (rolesPermitidos.includes(req.usuarioAuth.rol)) {
      return next();
    }

    const idBody = req.body[idName];
    const idValidarJWT = req.usuarioAuth._id;

    if (idBody != idValidarJWT) {
      return res.status(401).json({
        ok: false,
        msg: "No tienes permiso para acceder a este recurso",
      });
    }
    next();
  };
};

const esMiIdUrl = (idName = "id", ...rolesPermitidos) => {
  return (req, res = response, next) => {
    if (rolesPermitidos.includes(req.usuarioAuth.rol)) {
      return next();
    }
    const idUrl = req.params[idName];
    const idValidarJWT = req.usuarioAuth._id;
    if (idUrl != idValidarJWT) {
      return res.status(401).json({
        ok: false,
        msg: "No tienes permiso para acceder a este recurso",
      });
    }
    next();
  };
};

module.exports = { esMiIdUrl, estMiIdBody };
