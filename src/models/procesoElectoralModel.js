const { Schema, model } = require("mongoose");

const procesoElectoralSchema = new Schema(
  {
    cargo: {
      type: String,
      require: true,
      trim: true,
    },
    nombre: {
      type: String,
      require: true,
      trim: true,
    },
    apellido: {
      type: String,
      require: true,
      trim: true,
    },
    ci: {
      type: String,
      require: true,
      trim: true,
    },
    registro: {
      type: String,
      require: true,
      trim: true,
    },
    estado: {
        type: Boolean,
        trm: true
    }
  },
  {
    timestamps: true,
  }
);

module.exports = model("procesoElectoralModel", procesoElectoralSchema);
