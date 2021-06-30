const frenteCtrl = {};
const frenteModel = require("../models/frenteModel");
const universitarioModel = require("../models/universitarioModels");

const crypto = require("crypto-js");

const { unlink } = require("fs-extra");
const path = require("path");

frenteCtrl.getFrentes = async (req, res) => {
  const frente = await frenteModel.find();
  res.json(frente);
};

frenteCtrl.createFrente = async (req, res) => {
  const frente = {
    nombreFrente: crypto.AES.decrypt(
      req.body.nombreFrente,
      "palabraClave"
    ).toString(crypto.enc.Utf8),
    cuEncargado: crypto.AES.decrypt(
      req.body.cuEncargado,
      "palabraClave"
    ).toString(crypto.enc.Utf8),
    celularEncargado: crypto.AES.decrypt(
      req.body.celularEncargado,
      "palabraClave"
    ).toString(crypto.enc.Utf8),
  };
  const { cuEncargado } = frente;
  try {
    // let cu = parseInt(cuEncargado);
    const universitarios = await universitarioModel.find();
    // let universitario = await universitarioModel.findOne({ cu })
    let universitario = universitarios.filter(
      (res) =>
        crypto.AES.decrypt(res.cu, "palabraClave").toString(crypto.enc.Utf8) ===
        cuEncargado
    );
    if (universitario.length < 1) {
      await unlink(path.resolve("./public/images/" + req.file.filename));
      return res.status(400).json({ msg: "Error: Universitario no existe " });
    }
    let frentes = await frenteModel.find();
    let encargado = await frentes.filter(
      (res) =>
        crypto.AES.decrypt(res.cuEncargado, "palabraClave").toString(
          crypto.enc.Utf8
        ) === cuEncargado
    );
    if (encargado.length > 0) {
      await unlink(path.resolve("./public/images/" + req.file.filename));
      return res.status(400).json({
        msg: "Error: Ya existe un Frente con el Carnet Universitario",
      });
    }
    const newFrente = new frenteModel({
      nombreFrente: req.body.nombreFrente,
      cuEncargado: req.body.cuEncargado,
      celularEncargado: req.body.celularEncargado,
      logoFrente: "/images/" + req.file.filename,
    });
    await newFrente.save();
    res.send(frente);
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
