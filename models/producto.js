const { Schema, model } = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const {
  MAXCATEGORIASPORPRODUCTO,
} = require("../utils/constantes");

const ProductoSchema = new Schema({
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
  precio: {
    type: Number,
    default: 99999999,
    required: [true, "El precio es requerido"],
  },
  categorias: {
    type: [
      {
        type: Schema.Types.ObjectId,
        ref: "Categoria",
      },
    ],
    default: [],
    validate: function (value) {
      return value.length <= MAXCATEGORIASPORPRODUCTO;
    },
    required: [true, "La categoría es requerida"],
  },
  imagen: {
    type: String,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  relevancia: {
    type: Number,
    default: 3,
  },
  detalle_producto: {
    type: Schema.Types.ObjectId,
    ref: "DetalleProducto",
    required: [true, "El detalle del producto es requerido"],
  },
  cantidad: {
    type: Number,
    default: 0,
  },
});

ProductoSchema.method("toJSON", function () {
  let { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

ProductoSchema.plugin(mongoosePaginate);

module.exports = model("Producto", ProductoSchema);
