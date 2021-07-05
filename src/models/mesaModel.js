const { Schema, model } = require("mongoose");

const mesaSchema = new Schema(
  {
    mesa: {
      type: Number,
      require: true,
      trim: true,
    },
    cargo: {
      type: String,
      require: true,
      trim: true,
    },
    cuEncargado: {
      type: String,
      require: true,
      trim: true,
    },
    celularEncargado: {
      type: String,
      require: true,
      trim: true,
    },
    habilitado: {
      type: Boolean,
      trim: true,
    },
    registro: {
      type: String,
    },
    cargoEncargadoMesa: {
      type: String,
    },
    cuEncargadoMesa: {
      type: String,
    },
    celularEncargadoMesa: {
      type: String,
    },
    passwordEncargadoMesa: {
      type: String,
    },
    cargoVerificador: {
      type: String,
    },
    cuVerificador: {
      type: String,
    },
    celularVerificador: {
      type: String,
    },
    passwordVerificador: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = model("mesaModel", mesaSchema);
