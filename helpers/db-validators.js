const Role = require("../models/role");
const Usuario = require("../models/usuario");

const emailExiste = async (email = "") => {
  const existeEmail = await Usuario.findOne({ email });
  if (existeEmail) {
    throw new Error("El email " + email + " ya existe");
  }
  return true;
};

const usuarioExiste = async (id = "") => {
  try {
    const existeUsuario = await Usuario.findById(id);
    if (!existeUsuario) {
      throw new Error("El usuario con id " + id + " no existe");
    }
  } catch (error) {
    throw new Error("El usuario con id " + id + " no existe");
  }
};

const esRolValido = async (rol = "") => {
  const existeRol = await Role.findOne({ rol });
  if (!existeRol) {
    throw new Error("No existe el rol " + rol);
  }
};

module.exports = {
  emailExiste,
  usuarioExiste,
  esRolValido,
};
