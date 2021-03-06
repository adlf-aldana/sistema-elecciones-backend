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
        DecryptCu.toString()
    );
    // console.log(universitario[0].length);
    if (
      universitario.length > 0
      // && universitario[0].registro === req.body.registro
    ) {
      return res.status(400).json({ msg: "Error: El universitario ya existe" });
    }

    if (password) {
      // hashear el password
      const salt = await bcryptjs.genSalt(10);
      req.body.password = await bcryptjs.hash(password, salt);
      // Crea universitario
      universitario = new universitarioModel(req.body);
    } else {
      // Crea universitario
      universitario = new universitarioModel({
        nombre: req.body.nombre,
        apellidos: req.body.apellidos,
        cu: req.body.cu,
        ci: req.body.ci,
        carrera: req.body.carrera,
        cargo: req.body.cargo,
        registro: req.body.registro,
        email: req.body.email,
      });
    }
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
      // {
      //   expiresIn: 3600,
      // },
      (error, token) => {
        if (error) throw error;
        res.json({ token: token });
      }
    );
    // Mensaje de confirmaci??n
    res.json({ msg: "Universitario creado correctamente" });
  } catch (e) {
    console.log(e);
    res.status(400).json({ msg: "Error: No se guardaron los datos" });
  }
};

// OBTIENE A UN UNIVERSITARIO POR ID
univerCtrl.getUniversitario = async (req, res) => {
  // console.log(req.params.id);
  const universitarios = await universitarioModel.find();
  let universitario = universitarios.filter(
    (res) =>
      crypto.AES.decrypt(res.cu, "palabraClave").toString(crypto.enc.Utf8) ===
      req.params.id
  );
  let registroUniversitario = universitarios.filter(
    (res) => res.registro === req.params.id
  );

  if (registroUniversitario.length > 1) {
    return res.json({ registroUniversitario });
  }
  if (universitario.length < 1) {
    return res.json({ estudiante: universitario, registroUniversitario });
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
    registro: universitario[0].registro,
    email: universitario[0].email,
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
  try {
    const universitarios = await universitarioModel.find();

    const encargadoMesaVerificador = universitarios.filter(
      (res) =>
        crypto.AES.decrypt(res.cu, "palabraClave").toString(crypto.enc.Utf8) ===
        req.params.id
    );

    const { password } = req.body;

    if (password) {
      // hashear el password
      const salt = await bcryptjs.genSalt(10);
      req.body.password = await bcryptjs.hash(password, salt);
      // Crea universitario
      universitario = new universitarioModel(req.body);
    }

    if (encargadoMesaVerificador.length > 0) {
      universitario = encargadoMesaVerificador.map(async (res) => {
        await universitarioModel.findByIdAndUpdate(res._id, req.body);
      });
    } else {
      universitario = await universitarioModel.findByIdAndUpdate(
        req.params.id,
        req.body
      );
    }

    res.json({ universitario });
  } catch (e) {
    console.log(e);
  }
};

// ELIMINA A UN UNIVERSITARIO POR ID
univerCtrl.deleteUniversitario = async (req, res) => {
  await universitarioModel.findByIdAndDelete(req.params.id);
  res.json({ msg: "Universitario eliminado" });
};

module.exports = univerCtrl;
