const frenteCtrl = {};
const frenteModel = require("../models/frenteModel");
const universitarioModel = require("../models/universitarioModels");

const crypto = require("crypto-js");

const { unlink } = require("fs-extra");
const path = require("path");

frenteCtrl.getFrentes = async (req, res) => {
  const frente = await frenteModel.find();
  const nombre = await frenteModel.aggregate([
    {
      $group: {
        _id: "$nombreFrente",
        logoFrente: { $push: "$logoFrente" },
      },
    },
    ]);
  res.json({ nombre, frente });
};

frenteCtrl.createFrente = async (req, res) => {
  try {
    //   // let cu = parseInt(cuEncargado);
    const universitarios = await universitarioModel.find();

    let universitario = [];
    console.log(req.body.cuEncargado.length);
    req.body.cuEncargado.map((cu) => {
      universitario.push(
        universitarios.filter(
          (res) =>
            crypto.AES.decrypt(res.cu, "palabraClave").toString(
              crypto.enc.Utf8
            ) === cu
        )
      );
    });

    // VERIFICANDO QUE LOS CU DE LOS UNIVERSITARIOS EXISTAN, DENTRO DE LOS UNIVERSITARIOS EXISTENTES
    universitario.map(async (u) => {
      if (u.length < 1) {
        await unlink(path.resolve("./public/images/" + req.file.filename));
        return res.status(400).json({ msg: "Error: Universitario no existe " });
      }
    });
    //   let frentes = await frenteModel.find();
    //   let encargado = await frentes.filter(
    //     (res) =>
    //       crypto.AES.decrypt(res.cuEncargado, "palabraClave").toString(
    //         crypto.enc.Utf8
    //       ) === cuEncargado
    //   );
    //   if (encargado.length > 0) {
    //     await unlink(path.resolve("./public/images/" + req.file.filename));
    //     return res.status(400).json({
    //       msg: "Error: Ya existe un Frente con el Carnet Universitario",
    //     });
    //   }

    for (let i = 0; i < req.body.cargo.length; i++) {
      const newFrente = new frenteModel({
        nombreFrente: req.body.nombreFrente,
        logoFrente: "/images/" + req.file.filename,
        cargo: req.body.cargo[i],
        // cuEncargado: req.body.cuEncargado[i],
        // celularEncargado: req.body.celularEncargado[i],

        // cuEncargado: req.body.cuEncargado[i],
        // celularEncargado: req.body.celularEncargado[i],

        // nombreFrente: crypto.AES.encrypt(
        //   req.body.nombreFrente,
        //   "palabraClave"
        // ).toString(),
        // cargo: crypto.AES.encrypt(req.body.cargo[i], "palabraClave").toString(),
        cuEncargado: crypto.AES.encrypt(
          req.body.cuEncargado[i],
          "palabraClave"
        ).toString(),
        celularEncargado: crypto.AES.encrypt(
          req.body.celularEncargado[i],
          "palabraClave"
        ).toString(),
        // logoFrente: "/images/" + req.file.filename,
      });
      await newFrente.save();
    }

    // await newFrente.save();
    //   const newFrente = new frenteModel({
    //     nombreFrente: req.body.nombreFrente,
    //     cuEncargado: req.body.cuEncargado,
    //     celularEncargado: req.body.celularEncargado,
    //     logoFrente: "/images/" + req.file.filename,
    //   });
    res.send({ msg: "Guardado" });
  } catch (error) {
    console.log(error);
  }
};

frenteCtrl.getFrente = async (req, res) => {
  const frente = await frenteModel.findById(req.params.id);
  res.json({ msg: frente });
};

frenteCtrl.updateFrente = async (req, res) => {
  if (req.file) {
    // ELIMINANDO IMAGEN PASADA
    const { logoFrente } = await frenteModel.findById(req.params.id);
    await unlink(path.resolve("./public/" + logoFrente));
  }
  const { nombreFrente, cuEncargado, celularEncargado, logoFrente, cantVotos } =
    req.body;
  const frente = await frenteModel.findByIdAndUpdate(req.params.id, {
    nombreFrente,
    cuEncargado,
    celularEncargado,
    logoFrente: req.file ? "/images/" + req.file.filename : logoFrente,
    cantVotos,
  });
  res.json({ frente });
};

frenteCtrl.deleteFrente = async (req, res) => {
  const image = await frenteModel.findByIdAndDelete(req.params.id);
  await unlink(path.resolve("./public/" + image.logoFrente));
  res.json({ msg: "Frente Eliminado" });
};

module.exports = frenteCtrl;
