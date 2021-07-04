const mesaCtrl = {};
const mesaModel = require("../models/mesaModel");
const universitarioModel = require("../models/universitarioModels");

const crypto = require("crypto-js");

mesaCtrl.getMesas = async (req, res) => {
  const mesas = await mesaModel.find();
  const numMesa = await mesaModel.aggregate([
    {
      $group: {
        _id: "$mesa",
        id: { $push: "$_id" },
        habilitado: { $push: "$habilitado" },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);
  res.json({ mesas, numMesa });
};

mesaCtrl.createMesa = async (req, res) => {
  try {
    const universitarios = await universitarioModel.find();

    let universitario = [];

    req.body.map((mesa) => {
      universitario.push(
        universitarios.filter(
          (res) =>
            crypto.AES.decrypt(res.cu, "palabraClave").toString(
              crypto.enc.Utf8
            ) === mesa.cuEncargado
        )
      );
    });

    // VERIFICANDO QUE LOS CU DE LOS UNIVERSITARIOS EXISTAN, DENTRO DE LOS UNIVERSITARIOS EXISTENTES
    universitario.map(async (u) => {
      if (u.length < 1) {
        return res.status(400).json({ msg: "Error: Universitario no existe " });
      }
    });

    for (let i = 0; i < req.body.length; i++) {
      const newMesa = new mesaModel({
        mesa: req.body[0].mesa,
        registro: req.body[0].registro,
        cargo: req.body[i].cargo,
        cuEncargado: crypto.AES.encrypt(
          req.body[i].cuEncargado,
          "palabraClave"
        ).toString(),
        celularEncargado: crypto.AES.encrypt(
          req.body[i].celularEncargado,
          "palabraClave"
        ).toString(),
        habilitado: req.body[i].habilitado,
      });
      await newMesa.save();
    }
    res.send({ msg: "Guardado" });
  } catch (error) {
    console.log(error);
  }
};

mesaCtrl.getMesa = async (req, res) => {
  const mesas = await mesaModel.find();

  // FILTRANDO FRENTES QUE TENGAN LA MISMA FECHA DEL PROCESO ELECTORAL
  let registroMesas = mesas.filter((res) => res.registro === req.params.id);

  const nombreCadaMesaPorRegistro = await mesaModel.aggregate([
    { $match: { registro: req.params.id } },
    {
      $group: {
        _id: "$mesa",
        cargo: { $push: "$cargo" },
        cuEncargado: { $push: "$cuEncargado" },
        celularEncargado: { $push: "$celularEncargado" },
        habilitado: { $push: "$habilitado" },
        id: { $push: "$_id" },
      },
    },
  ]);
  // const nombreCadaFrentePorRegistro = await frenteModel.distinct('nombreFrente', {registro: req.params.id})

  res.json({ registroMesas, nombreCadaMesaPorRegistro });
};

mesaCtrl.updateMesa = async (req, res) => {
  const mesas = await mesaModel.findByIdAndUpdate(req.params.id, {
    habilitado: !req.body[0],
  });

  const numMesa = await mesaModel.aggregate([
    {
      $group: {
        _id: "$mesa",
        id: { $push: "$_id" },
        habilitado: { $push: "$habilitado" },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);
  res.json({ mesas, numMesa });
};

mesaCtrl.deleteMesa = async (req, res) => {
  try {
    console.log(req.params.id);
    await mesaModel.findByIdAndDelete(req.params.id);
    res.json({ msg: "Mesa Eliminada" });
  } catch (error) {
    console.log(error);
  }
};

module.exports = mesaCtrl;
