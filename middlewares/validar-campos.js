const { validationResult } = require("express-validator");
//Esta funcion es un middleware que se ejecuta antes de que se ejecute el controlador,
//sirve para validar los datos que se reciben en el controlador
const validarCampos = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
module.exports = {
  validarCampos,
};
