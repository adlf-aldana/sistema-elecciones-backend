const mesaCtrl = {};
const mesaModel = require("../models/mesaModel");
const universitarioModel = require("../models/universitarioModels");

const crypto = require("crypto-js");
const bcryptjs = require("bcryptjs");

mesaCtrl.getMesas = async (req, res) => {
  const mesas = await mesaModel.find();
  const numMesa = await mesaModel.aggregate([
    {
      $group: {
        _id: "$mesa",
        cargo: { $push: "$cargo" },
        cuEncargado: { $push: "$cuEncargado" },
        celularEncargado: { $push: "$celularEncargado" },
        habilitado: { $push: "$habilitado" },
        id: { $push: "$_id" },
        cuEncargadoMesa: { $push: "$cuEncargadoMesa" },
        cargoEncargadoMesa: { $push: "$cargoEncargadoMesa" },
        cargoVerificador: { $push: "$cargoVerificador" },
        cuVerificador: { $push: "$cuVerificador" },
        celularEncargadoMesa: { $push: "$celularEncargadoMesa" },
        celularVerificador: { $push: "$celularVerificador" },
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
    for (let i = 0; i < universitario.length; i++) {
      if (universitario[i].length < 1) {
        return res.status(400).json({ msg: "Error: Universitario no existe " });
      }
    }

    const comprobandoCuEncargado = universitarios.filter(
      (res) =>
        crypto.AES.decrypt(res.cu, "palabraClave").toString(crypto.enc.Utf8) ===
        req.body[0].cuEncargadoMesa
    );

    const comprobandoCuVerificador = universitarios.filter(
      (res) =>
        crypto.AES.decrypt(res.cu, "palabraClave").toString(crypto.enc.Utf8) ===
        req.body[0].cuVerificador
    );

    if (comprobandoCuEncargado.length < 1) {
      return res.status(400).json({ msg: "Error: Universitario no existe " });
    }

    if (comprobandoCuVerificador.length < 1) {
      return res.status(400).json({ msg: "Error: Universitario no existe " });
    }
    // HASHEANDO PASSWORD ENCARGADO DE MESA
    const salt = await bcryptjs.genSalt(10);
    req.body[0].passwordEncargadoMesa = await bcryptjs.hash(
      req.body[0].passwordEncargadoMesa,
      salt
    );

    // HASHEANDO PASSWORD VERIFICADOR
    const salt2 = await bcryptjs.genSalt(10);
    req.body[0].passwordVerificador = await bcryptjs.hash(
      req.body[0].passwordVerificador,
      salt2
    );

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

        cargoEncargadoMesa: req.body[0].cargoEncargadoMesa,
        cuEncargadoMesa: req.body[0].cuEncargadoMesa,
        celularEncargadoMesa: req.body[0].celularEncargadoMesa,
        passwordEncargadoMesa: req.body[0].passwordEncargadoMesa,
        cargoVerificador: req.body[0].cargoVerificador,
        cuVerificador: req.body[0].cuVerificador,
        celularVerificador: req.body[0].celularVerificador,
        passwordVerificador: req.body[0].passwordVerificador,
      });
      await newMesa.save();
    }
    res.send({ msg: "Guardado" });
  } catch (error) {
    console.log(error);
    res.send({ msg: error });
  }
};

mesaCtrl.getMesa = async (req, res) => {
  // const loginDatos = await mesaModel.find();

  // const datosEncargadoMesa = loginDatos.filter(
  //   (res) => res.cuEncargadoMesa === req.params.id
  // );

  // const datosVerificador = loginDatos.filter(
  //   (res) => res.cuVerificador === req.params.id
  // );

  const mesas = await mesaModel.find();

  // FILTRANDO FRENTES QUE TENGAN LA MISMA FECHA DEL PROCESO ELECTORAL
  let registroMesas = mesas.filter((res) => res.registro === req.params.id);
  let mesaAbierta = mesas.filter(
    (res) =>
      res.cuEncargadoMesa === req.params.id ||
      res.cuVerificador === req.params.id
  );

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
        cuEncargadoMesa: { $push: "$cuEncargadoMesa" },
        cargoEncargadoMesa: { $push: "$cargoEncargadoMesa" },
        cargoVerificador: { $push: "$cargoVerificador" },
        cuVerificador: { $push: "$cuVerificador" },
        celularEncargadoMesa: { $push: "$celularEncargadoMesa" },
        celularVerificador: { $push: "$celularVerificador" },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);
  // const nombreCadaFrentePorRegistro = await frenteModel.distinct('nombreFrente', {registro: req.params.id})

  res.json({
    registroMesas,
    nombreCadaMesaPorRegistro,
    mesaAbierta,
  });

  // res.json({
  //   registroMesas,
  //   nombreCadaMesaPorRegistro,
  //   datosEncargadoMesa,
  //   datosVerificador,
  // });
};

mesaCtrl.updateMesa = async (req, res) => {
  try {
    if (req.params.id === "0") {
      // ACTUALIZA TODOS LOS DATOS
      await req.body.map(async (dato) => {
        const mesas = await mesaModel.findByIdAndUpdate(dato.id, {
          mesa: dato.mesa,
          registro: dato.registro,
          cargo: dato.cargo,
          cuEncargado: crypto.AES.encrypt(
            dato.cuEncargado,
            "palabraClave"
          ).toString(),
          celularEncargado: crypto.AES.encrypt(
            dato.celularEncargado,
            "palabraClave"
          ).toString(),
          habilitado: dato.habilitado,

          cargoEncargadoMesa: dato.cargoEncargadoMesa,
          cuEncargadoMesa: dato.cuEncargadoMesa,
          celularEncargadoMesa: dato.celularEncargadoMesa,
          passwordEncargadoMesa: dato.passwordEncargadoMesa,
          cargoVerificador: dato.cargoVerificador,
          cuVerificador: dato.cuVerificador,
          celularVerificador: dato.celularVerificador,
        });
      });
    } else {
      //SOLO ACTUALIZA SI HABILITA O DESHABILITA LA MESA
      const mesas = await mesaModel.findByIdAndUpdate(req.params.id, {
        habilitado: !req.body[0],
      });
    }
    res.json({ msg: "Editado correctamten" });
  } catch (error) {
    console.log(error);
    res.json({ msg: "Error: Se produjo un error al actualizar los datos" });
  }

  // // const nombreCadaMesaPorRegistro = await mesaModel.aggregate([
  // //   { $match: { registro: req.params.id } },
  // //   {
  // //     $group: {
  // //       _id: "$mesa",
  // //       cargo: { $push: "$cargo" },
  // //       cuEncargado: { $push: "$cuEncargado" },
  // //       celularEncargado: { $push: "$celularEncargado" },
  // //       habilitado: { $push: "$habilitado" },
  // //       id: { $push: "$_id" },
  // //     },
  // //   },
  // // ]);
  // const numMesa = await mesaModel.aggregate([
  //   {
  //     $group: {
  //       _id: "$mesa",
  //       cargo: { $push: "$cargo" },
  //       cuEncargado: { $push: "$cuEncargado" },
  //       celularEncargado: { $push: "$celularEncargado" },
  //       habilitado: { $push: "$habilitado" },
  //       id: { $push: "$_id" },
  //       cuEncargadoMesa: { $push: "$cuEncargadoMesa" },
  //       cargoEncargadoMesa: { $push: "$cargoEncargadoMesa" },
  //       cargoVerificador: { $push: "$cargoVerificador" },
  //       cuVerificador: { $push: "$cuVerificador" },
  //       celularEncargadoMesa: { $push: "$celularEncargadoMesa" },
  //       celularVerificador: { $push: "$celularVerificador" },

  //       // id: { $push: "$_id" },
  //       // habilitado: { $push: "$habilitado" },
  //       // cargo: { $push: "$cargo" },
  //       // cuEncargado: { $push: "$cuEncargado" },
  //       // celularEncargado: { $push: "$celularEncargado" },
  //     },
  //   },
  //   {
  //     $sort: { _id: 1 },
  //   },
  // ]);

  // res.json({ mesas, numMesa });
};

mesaCtrl.deleteMesa = async (req, res) => {
  try {
    await mesaModel.findByIdAndDelete(req.params.id);
    res.json({ msg: "Mesa Eliminada" });
  } catch (error) {
    console.log(error);
  }
};

module.exports = mesaCtrl;
