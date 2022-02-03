const { Router } = require("express");
const { check } = require("express-validator");
const { ingresar } = require("../controllers/auth.controller");
const { validarCampos } = require("../middlewares/validar-campos");

const router = Router();

router.post("/", ingresar);

module.exports = router;
