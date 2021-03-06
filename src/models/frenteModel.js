const { Schema, model } = require("mongoose");

const frenteSchema = new Schema(
  {
    nombreFrente: {
      type: String,
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
    logoFrente: {
      type: String,
    },
    registro: {
      type: String
    }
  },
  {
    timestamps: true,
  }
);

module.exports = model("frenteModel", frenteSchema);
