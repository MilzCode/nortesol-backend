const { Schema, model } = require("mongoose");

const CategoriaSchema = new Schema({
  nombre: {
    type: String,
    required: [true, "El nombre es requerido"],
    unique: true,
  },
  estado: {
    type: Boolean,
    default: true,
    required: [true, "El estado es requerido"],
  },
  descripcion: {
    type: String,
    default: "",
  },
});

CategoriaSchema.method("toJSON", function () {
  let { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

module.exports = model("Categoria", CategoriaSchema);
