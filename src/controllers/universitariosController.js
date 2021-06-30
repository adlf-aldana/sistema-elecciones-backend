const univerCtrl = {};
const universitarioModel = require("../models/universitarioModels");
const { validationResult } = require("express-validator");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto-js");

// OBTIENE A TODOS LOS UNIVERSITARIOS
univerCtrl.getUniversitarios = async (req, res) => {
  try {
    // consultando
    const universitario = await universitarioModel.find();
    // const universitariosSinAdmins = await universitarioModel.find({
    //   cargo: { $gt: "Administrador" },
    // });
    const universitariosSinAdmins = universitario.filter(
      (res) =>
        crypto.AES.decrypt(res.cargo, "palabraClave").toString(
          crypto.enc.Utf8
        ) !== "Administrador"
    );

    res.json({ universitario, universitariosSinAdmins });
  } catch (e) {
    return res
      .status(400)
      .json({ msg: "No se tiene acceso a la base de datos" });
  }
};

// GUARDA UN NUEVO UNIVERSTARIO
univerCtrl.createUniversitario = async (req, res) => {
  const decryptData = crypto.AES.decrypt(req.body.cu, "palabraClave").toString(
    crypto.enc.Utf8
  );

  // Revisar si hay errorres
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({ msg: errores.errors[0].msg });
  }
  // Extrayendo carnet universitario
  const { password } = req.body;
  try {
    const DecryptCu = decryptData.toString(crypto.enc.Utf8);
    // Revisar que el universitario sea unico
    let universitarios = await universitarioModel.find();
    let universitario = await universitarios.filter(
      (res) =>
        crypto.AES.decrypt(res.cu, "palabraClave").toString(crypto.enc.Utf8) ===
        DecryptCu
    );
    if (universitario.length > 0) {
      return res.status(400).json({ msg: "Error: El universitario ya existe" });
    }
    //   // hashear el password
    const salt = await bcryptjs.genSalt(10);
    req.body.password = await bcryptjs.hash(password, salt);
    // Crea universitario
    universitario = new universitarioModel(req.body);
    // if (password) {
    //   // hashear el password
    //   const salt = await bcryptjs.genSalt(10);
    //   req.body.password = await bcryptjs.hash(password, salt);
    //   // Crea universitario
    //   universitario = new universitarioModel(req.body);
    // } else {
    //   // Crea universitario
    //   universitario = new universitarioModel({
    //     nombre,
    //     apellidos,
    //     cu,
    //     carrera,
    //     cargo,
    //   });
    // }
    // Guarda a Universitario
    await universitario.save();
    // // crear y firmar JWT
    const payload = {
      universitario: {
        id: universitario.id,
      },
    };
    // Firmar el JWT
    jwt.sign(
      payload,
      process.env.SECRETA,
      {
        expiresIn: 3600,
      },
      (error, token) => {
        if (error) throw error;
        res.json({ token: token });
      }
    );
    // Mensaje de confirmación
    res.json({ msg: "Universitario creado correctamente" });
  } catch (e) {
    res.status(400).json({ msg: "Hubo un error" });
  }
};

// OBTIENE A UN UNIVERSITARIO POR ID
univerCtrl.getUniversitario = async (req, res) => {
  const universitarios = await universitarioModel.find();
  let universitario = universitarios.filter(
    (res) =>
    crypto.AES.decrypt(res.cu, "palabraClave").toString(crypto.enc.Utf8) ===
    req.params.id
    );
  if (universitario.length < 1) {
    return res.status(400).json({ msg: "Error: El universitario no existe" });
  }
  universitario = {
    id: universitario[0].id,
    nombre: crypto.AES.decrypt(
      universitario[0].nombre,
      "palabraClave"
    ).toString(crypto.enc.Utf8),
    apellidos: crypto.AES.decrypt(
      universitario[0].apellidos,
      "palabraClave"
    ).toString(crypto.enc.Utf8),
    cu: crypto.AES.decrypt(universitario[0].cu, "palabraClave").toString(
      crypto.enc.Utf8
    ),
    ci: crypto.AES.decrypt(universitario[0].ci, "palabraClave").toString(
      crypto.enc.Utf8
    ),
    carrera: crypto.AES.decrypt(
      universitario[0].carrera,
      "palabraClave"
    ).toString(crypto.enc.Utf8),
    cargo: crypto.AES.decrypt(universitario[0].cargo, "palabraClave").toString(
      crypto.enc.Utf8
    ),
  };
  res.json({ estudiante: universitario });
};

// ACTUALIZA UN UNIVERSITARIO POR ID
univerCtrl.updateUniversitario = async (req, res) => {
  const universitario = await universitarioModel.findByIdAndUpdate(
    req.params.id,
    req.body
  );
  res.json({ universitario });
};

// ELIMINA A UN UNIVERSITARIO POR ID
univerCtrl.deleteUniversitario = async (req, res) => {
  await universitarioModel.findByIdAndDelete(req.params.id);
  res.json({ msg: "Universitario eliminado" });
};

module.exports = univerCtrl;
