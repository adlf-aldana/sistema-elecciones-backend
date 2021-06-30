const { Schema, model } = require("mongoose");

const universitarioSchema = new Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
      // unique: true
    },
    apellidos: {
      type: String,
      require: true,
      trim: true,
    },
    cu: {
      type: String,
      require: true,
      trim: true,
      unique: true
    },
    ci: {
      type: String,
      require: true,
      trim: true,
      unique: true
    },
    carrera: {
      type: String,
      require: true,
      trim: true,
    },
    cargo: {
      type: String,
      require: true,
      trim: true,
    },
    password: {
      type: String
    }
  },
  {
    // fecha y hora de creación o edicion de universitario
    timestamps: true,
  }
);

module.exports = model("universitarioModel", universitarioSchema);
