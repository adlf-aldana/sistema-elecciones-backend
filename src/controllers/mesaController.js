const mesaCtrl = {};
const mesaModel = require("../models/mesaModel");
const universitarioModel = require("../models/universitarioModels");

const crypto = require("crypto-js");

mesaCtrl.getMesas = async (req, res) => {
  const mesas = await mesaModel.find();
  // const numMesa = await mesaModel.distinct("mesa");
  const numMesa = await mesaModel.aggregate([
    {
      $group: {
        _id: "$mesa",
        id: { $push: "$_id" },
        habilitado: { $push: "$habilitado" },
      },
    },
  ]);
  res.json({ mesas, numMesa });
};

mesaCtrl.createMesa = async (req, res) => {
  try {
    // const cu = req.body[0].cuEncargado;
    // const mesas = await mesaModel.find();

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
        console.log("no existe");
        return res.status(400).json({ msg: "Error: Universitario no existe " });
      }
    });

    for (let i = 0; i < req.body.length; i++) {
      const newMesa = new mesaModel({
        mesa: req.body[0].mesa,
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
  const mesa = await mesaModel.findById(req.params.id);
  res.json({ msg: mesa });
};

mesaCtrl.updateMesa = async (req, res) => {
  console.log(req.params);
  console.log(!req.body[0]);

  await mesaModel.findByIdAndUpdate(req.params.id, {habilitado: !req.body[0]});
  
};

mesaCtrl.deleteMesa = async (req, res) => {
  await mesaCtrl.findByIdAndDelete(req.params.id);
  res.json({ msg: "Frente Eliminado" });
};

module.exports = mesaCtrl;
