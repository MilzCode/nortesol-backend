const { Router } = require("express");
const { check } = require("express-validator");
const {
  crearPedido,
  buscarPedido,
  pedidosUsuarioId,
} = require("../controllers/pedidos.controller");
const { usuarioExiste } = require("../helpers/db-validators");
const { validarCampos } = require("../middlewares/validar-campos");
const { validarJWT } = require("../middlewares/validar-jwt");
const { estMiIdBody, esMiIdUrl } = require("../middlewares/validar-mi-id");
const router = Router();

// router.get("/", (req, res) => {
//   console.log("hola");
//   res.json({ msg: "hola" });
// });

/*
TODO:
- esta ruta solo puede acceder el administrador
*/
router.get("/:idoemail?", buscarPedido);

router.get(
  "/mis-pedidos/:idUsuario",
  [
    validarJWT,
    check(
      "idUsuario",
      "El id del usuario debe ser un ObjectId valido"
    ).isMongoId(),
    esMiIdUrl("idUsuario", "ADMIN"),//solo el usuario y el administrador pueden acceder a esta ruta
    validarCampos,
  ],
  pedidosUsuarioId
);
/* 
    TODO: Almacenar datos en mayusculas
    - Validar que los campos obligatorios esten presentes

*/
router.post(
  "/",
  [
    validarJWT,
    estMiIdBody("usuario"),
    check("usuario", "El usuario es obligatorio").not().isEmpty(),
    check("usuario", "El usuario debe ser un ObjectId").isMongoId(),
    check("usuario").custom(usuarioExiste),
    check("productos", "Los productos son obligatorios").not().isEmpty(),
    check("productos.*.producto", "El producto es obligatorio").not().isEmpty(),
    check("productos.*.cantidad", "La cantidad debe ser numerica").isNumeric(),
    // check("productos.*.producto", "La cantidad debe ser menor a 100").isInt({
    //   lt: 100,
    // }),
    check(
      "productos.*.producto",
      "El producto debe ser un ObjectId"
    ).isMongoId(),
    check("ubicacion", "La ubicacion es obligatoria").not().isEmpty(),
    check("ubicacion.region", "La ubicacion debe contener una region")
      .not()
      .isEmpty(),
    check("ubicacion.ciudad", "La ubicacion debe contener una ciudad")
      .not()
      .isEmpty(),
    check("ubicacion.direccion", "La ubicacion debe contener una direccion")
      .not()
      .isEmpty(),
    validarCampos,
  ],
  crearPedido
);

module.exports = router;
