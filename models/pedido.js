const { Schema, model } = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const PedidoSchema = new Schema({
  estado: {
    type: Boolean,
    default: true,
    required: [true, "El estado es requerido"],
  },
  totales: {
    type: Number,
    default: 99999999,
  },
  usuario: {
    type: Schema.Types.ObjectId,
    ref: "Usuario",
    required: [true, "El usuario es requerido"],
  },
  productos: {
    type: [
      {
        cantidad: {
          type: Number,
          default: 0,
          required: [true, "La cantidad es requerida"],
        },
        producto: {
          type: Schema.Types.ObjectId,
          ref: "Producto",
          required: [true, "El producto es requerido"],
        },
        total: {
          type: Number,
          default: 99999999,
          required: [true, "El total es requerido"],
        },
        nombre: {
          type: String,
          required: [true, "El nombre es requerido"],
        },
      },
    ],
    required: [true, "Los productos son requeridos"],
    default: [],
  },
  pagado: {
    type: Boolean,
    default: false,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  ubicacion: {
    type: {
      region: { type: String, required: [true, "La region es requerida"] },
      ciudad: { type: String, required: [true, "La ciudad es requerida"] },
      direccion: {
        type: String,
        required: [true, "La ubicacion es requerida"],
      },
    },
    default: {
      region: "",
      ciudad: "",
      direccion: "",
    },
    required: [true, "La direccion es requerida"],
  },
});

PedidoSchema.method("toJSON", function () {
  let { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});
PedidoSchema.plugin(mongoosePaginate);

module.exports = model("Pedido", PedidoSchema);
