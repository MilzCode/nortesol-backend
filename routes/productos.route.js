const { Router } = require("express");
const { check } = require("express-validator");
const {
  crearProducto,
  mostrarProductosPage,
  mostrarProducto,
} = require("../controllers/productos.controller");
const { validarCampos } = require("../middlewares/validar-campos");
const router = Router();

/*
  TODO: falta hacer validaciones
  - Validar que esten todos los campos obligatorios ok.
  - Validar que las categorias sean validas ok.
  - Validar que solo el administrador pueda crear Productos.
  */
router.post(
  "/",
  [
    check("nombre", "El nombre del producto es obligatorio").not().isEmpty(),
    // //nombre solo alfanumerico
    // check(
    //   "nombre",
    //   "El nombre del producto debe ser alfanumerico"
    // ).isAlphanumeric(),
    //max length
    check(
      "nombre",
      "El nombre del producto debe tener menos de 50 caracteres"
    ).isLength({ max: 50 }),
    check("precio", "El precio del producto es obligatorio").not().isEmpty(),
    check("categorias", "Las categorias del producto son obligatorias")
      .not()
      .isEmpty(),
    // check("descripcion", "La descripcion del producto es obligatoria").not().isEmpty(),
    // check("relevancia", "La relevancia del producto es obligatoria").not().isEmpty(),
    // check("cantidad", "La cantidad del producto es obligatoria").not().isEmpty(),

    validarCampos,
  ],
  crearProducto
);

router.get("/", mostrarProductosPage);

router.get(
  "/:id",
  [
    check("id", "El id del producto es obligatorio").not().isEmpty(),
    check("id", "El id del producto debe ser un ObjectId valido").isMongoId(),
    validarCampos,
  ],
  mostrarProducto
);

module.exports = router;
