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
      unique: true,
    },
    ci: {
      type: String,
      require: true,
      trim: true,
      unique: true,
    },
    email: {
      type: String
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
    registro: {
      type: String,
      require: true,
    },
    password: {
      type: String,
    },
    cargoLogin: {
      type:String
    }
  },
  {
    // fecha y hora de creación o edicion de universitario
    timestamps: true,
  }
);

module.exports = model("universitarioModel", universitarioSchema);
