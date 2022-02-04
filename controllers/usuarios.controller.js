const { response } = require("express");
const bcryptjs = require("bcryptjs");
const Usuario = require("../models/usuario");
const { MINCARACTERESCONTRASENA } = require("../utils/constantes");
const formatoRut = require("../utils/formato-rut");

const crearUsuario = async (req, res = response) => {
  try {
    const { nombre, rut, email, celular, region, ciudad, direccion } = req.body;
    const salt = await bcryptjs.genSalt();
    const password = await bcryptjs.hash(req.body.password, salt);
    const nuevoUsuario = new Usuario({
      nombre,
      rut: formatoRut(rut),
      email,
      celular,
      region,
      ciudad,
      direccion,
      password,
      // rut_original: rut,//este campo es seguridad en caso de que se modifique el rut, mantener el rut original de registro.
      email_original: email,
    });
    await nuevoUsuario.save();
    return res.json({
      ok: true,
      msg: "Usuario creado correctamente",
      usuario: nuevoUsuario,
    });
  } catch (error) {
    console.log(error);
    if (error.code === 11000 && error.keyValue.email) {
      return res.status(400).json({
        ok: false,
        msg: "El correo ya existe",
      });
    }
    return res.status(500).json({
      ok: false,
      msg: "Error inesperado al crear usuario, consulte con el administrador",
    });
  }
};

/**
 * Editar usuario recibe:
 * params:
 * - id
 * body:
 * - nombre
 * - rut
 * - email
 * - celular
 * - region
 * - ciudad
 * - direccion
 */

/*
  TODO:
  - si edita contraseña, se debe validar que la contraseña actual sea correcta,
  - si edita contraseña se debe enviar un email al correo.
  - si edita email, se debe validar que el email no exista en la base de datos.
  - si edita email se debe enviar un email al correo anterior por siacaso.

*/
const editarUsuario = async (req, res = response) => {
  try {
    const { id } = req.params;

    const { nombre, email, celular, region, ciudad, direccion, password } =
      req.body;
    let newPassword;
    if (password) {
      if (password.length < MINCARACTERESCONTRASENA) {
        return res.status(400).json({
          ok: false,
          msg:
            "La contraseña debe tener al menos " +
            MINCARACTERESCONTRASENA +
            " caracteres",
        });
      }
      const salt = await bcryptjs.genSalt();
      newPassword = await bcryptjs.hash(password, salt);
    }
    let usuarioActualizado = {
      nombre,
      email,
      celular,
      region,
      ciudad,
      direccion,
      password: newPassword,
    };
    const usuarioDB = await Usuario.findByIdAndUpdate(id, usuarioActualizado, {
      new: true,
    });

    if (!usuarioDB) {
      return res.status(404).json({
        ok: false,
        msg: "No existe un usuario con ese ID",
      });
    }
    if (password) {
      usuarioActualizado.password = "actualizada";
    }

    return res.json({
      ok: true,
      msg: "Usuario actualizado correctamente",
      datos_actualizados: usuarioActualizado,
    });
  } catch (error) {
    console.log(error);
    if (error.code === 11000 && error.keyValue.email) {
      return res.status(400).json({
        ok: false,
        msg: "El correo ya existe",
      });
    }
    return res.status(500).json({
      ok: false,
      msg: "Error inesperado al editar usuario, consulte con el administrador",
    });
  }
};

const verDatosUsuario = async (req, res = response) => {
  try {
    const { id } = req.params;
    const usuarioDB = await Usuario.findById(id);
    if (!usuarioDB) {
      return res.status(404).json({
        ok: false,
        msg: "No existe un usuario con ese ID",
      });
    }
    const admin = usuarioDB.rol === "ADMIN" ? true : undefined;

    return res.json({
      ok: true,
      msg: "Datos del usuario",
      usuario: usuarioDB,
      admin,
    });
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      ok: false,
      msg: "Error inesperado al editar usuario, consulte con el administrador",
    });
  }
};

module.exports = {
  crearUsuario,
  editarUsuario,
  verDatosUsuario,
};
