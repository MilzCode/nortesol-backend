const Usuario = require("../models/usuario");
const bcryptjs = require("bcryptjs");
const { generarJWT } = require("../helpers/generar-jwt");

const ingresar = async (req, res) => {
  try {
    const { email, password } = req.body;

    const usuarioDB = await Usuario.findOne({ email });
    if (!usuarioDB) {
      return res.status(400).json({
        ok: false,
        msg: "El usuario o password son incorrectos",
      });
    }

    // if (!usuarioDB.estado) {
    //   return res.status(400).json({
    //     ok: false,
    //     msg: "El usuario no esta habilitado",
    //   });
    // }

    const validPassword = bcryptjs.compareSync(password, usuarioDB.password);
    if (!validPassword) {
      return res.status(400).json({
        ok: false,
        msg: "El usuario o password son incorrectos - password",
      });
    }
    const token = await generarJWT(usuarioDB._id);

    res.json({
      usuarioDB,
      token,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      ok: false,
      msg: "Error inesperado al crear pedido, consulte con el administrador",
    });
  }
};

module.exports = { ingresar };
