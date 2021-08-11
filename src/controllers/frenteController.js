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
        id: { $push: "$_id" },
        logoFrente: { $push: "$logoFrente" },
      },
    },
  ]);
  res.json({ nombre, frente });
};

frenteCtrl.createFrente = async (req, res) => {
  try {
    const universitarios = await universitarioModel.find();

    let universitario = [];
    console.log(req.body.cuEncargado);
    if (req.body.cuEncargado.length > 1) {
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
    } else {
      universitario.push(
        universitarios.filter(
          (res) =>
            crypto.AES.decrypt(res.cu, "palabraClave").toString(
              crypto.enc.Utf8
            ) === cu
        )
      );
    }

    for (let i = 0; i < universitario.length; i++) {
      if (universitario[i].length < 1) {
        await unlink(path.resolve("./public/images/" + req.file.filename));
        return res.status(400).json({ msg: "Error: Universitario no existe " });
      }
    }

    for (let i = 0; i < req.body.cargo.length; i++) {
      const newFrente = new frenteModel({
        nombreFrente: req.body.nombreFrente,
        registro: req.body.registro[0],
        logoFrente: "/images/" + req.file.filename,
        cargo: req.body.cargo[i],
        cuEncargado: crypto.AES.encrypt(
          req.body.cuEncargado[i],
          "palabraClave"
        ).toString(),
        celularEncargado: crypto.AES.encrypt(
          req.body.celularEncargado[i],
          "palabraClave"
        ).toString(),
      });
      await newFrente.save();
    }
    res.send({ msg: "Guardado" });
  } catch (error) {
    console.log(error);
  }
};

frenteCtrl.getFrente = async (req, res) => {
  const frentes = await frenteModel.find();

  // FILTRANDO FRENTES QUE TENGAN LA MISMA FECHA DEL PROCESO ELECTORAL
  let registroFrentes = frentes.filter((res) => res.registro === req.params.id);

  const nombreCadaFrentePorRegistro = await frenteModel.aggregate([
    { $match: { registro: req.params.id } },
    {
      $group: {
        _id: "$nombreFrente",
        cargo: { $push: "$cargo" },
        celularEncargado: { $push: "$celularEncargado" },
        cuEncargado: { $push: "$cuEncargado" },
        logoFrente: { $push: "$logoFrente" },
        id: { $push: "$_id" },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);
  // const nombreCadaFrentePorRegistro = await frenteModel.distinct('nombreFrente', {registro: req.params.id})

  res.json({ registroFrentes, nombreCadaFrentePorRegistro });
};

frenteCtrl.updateFrente = async (req, res) => {
  try {
    // const archivo = req.file;
    // if (archivo) {
    //   // ELIMINANDO IMAGEN PASADA
    //   let { logoFrente } = await frenteModel.findById(req.params.id);
    //   await unlink(path.resolve("./public/" + logoFrente));
    //   // }
    // }

    const universitarios = await universitarioModel.find();

    let universitario = [];
    if (req.body.cuEncargado.length > 1) {
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
    } else {
      universitario.push(
        universitarios.filter(
          (res) =>
            crypto.AES.decrypt(res.cu, "palabraClave").toString(
              crypto.enc.Utf8
            ) === cu
        )
      );
    }

    for (let i = 0; i < universitario.length; i++) {
      if (universitario[i].length < 1) {
        if (req.file)
          await unlink(path.resolve("./public/images/" + req.file.filename));
        console.log(universitario[i].length);
        return res.status(400).json({ msg: "Error: Universitario no existe " });
      }
    }

    for (let i = 0; i < req.body.cargo.length; i++) {
      await frenteModel.findByIdAndUpdate(req.body.id[i], {
        nombreFrente: req.body.nombreFrente,
        registro: req.body.registro[0],
        logoFrente: req.file
          ? "/images/" + req.file.filename
          : req.body.logoFrente,
        cargo: req.body.cargo[i],
        cuEncargado: crypto.AES.encrypt(
          req.body.cuEncargado[i],
          "palabraClave"
        ).toString(),
        celularEncargado: crypto.AES.encrypt(
          req.body.celularEncargado[i],
          "palabraClave"
        ).toString(),
      });
    }
    res.json({ msg: "guardado correctamente" });
  } catch (e) {
    console.log(e);
    res.json({ msg: "Error: Se produjo un error al actualizar los datos" });
  }
};

frenteCtrl.deleteFrente = async (req, res) => {
  const image = await frenteModel.findByIdAndDelete(req.params.id);
  await unlink(path.resolve("./public/" + image.logoFrente));
  res.json({ msg: "Frente Eliminado" });
};

module.exports = frenteCtrl;
