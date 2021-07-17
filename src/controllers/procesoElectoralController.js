const procesoCtrl = {};
const procesoElectoralModel = require("../models/procesoElectoralModel");
const mesaModel = require("../models/mesaModel");
const universitarioModels = require("../models/universitarioModels");
const frenteModel = require("../models/frenteModel");
const votanteModels = require("../models/votanteModels");
const crypto = require("crypto-js");

procesoCtrl.getProcesosElectorales = async (req, res) => {
  try {
    const ultimoProcesoElectoral = await procesoElectoralModel
      .find()
      .sort({ $natural: -1 })
      .limit(1);

    const procesosElectorales = await procesoElectoralModel.aggregate([
      {
        $group: {
          _id: "$registro",
          id: { $push: "$_id" },
          nombre: { $push: "$nombre" },
          apellido: { $push: "$apellido" },
          ci: { $push: "$ci" },
          cargo: { $push: "$cargo" },
          estado: { $push: "$estado" },
        },
      },
    ]);
    res.json({ procesosElectorales, ultimoProcesoElectoral });
  } catch (error) {
    res.json({
      msg: "Ocurrio un error al obtener ultimo proceso electoral y a todos los procesos electorales",
    });
  }
};

procesoCtrl.createProcesoElectoral = async (req, res) => {
  let fechaHoraActual;
  let date = new Date();

  let day = date.getDate();
  let month = date.getMonth() + 1;
  let year = date.getFullYear();
  let hour = date.getHours();
  let minute = date.getMinutes();

  if (month < 10) {
    fechaHoraActual = `${day}-0${month}-${year}:${hour}:${minute}`;
  } else {
    fechaHoraActual = `${day}-${month}-${year}:${hour}:${minute}`;
  }

  try {
    for (let i = 0; i < req.body.length; i++) {
      const nuevo = new procesoElectoralModel({
        registro: fechaHoraActual,
        cargo: req.body[i].cargo,
        nombre: req.body[i].nombre,
        apellido: req.body[i].apellido,
        ci: req.body[i].ci,
        estado: true,
      });
      await nuevo.save();
    }
    res.send({ msg: "Guardado" });
  } catch (error) {
    console.log(error);
  }
};

procesoCtrl.getProcesoElectoral = async (req, res) => {
  const mesa = await mesaModel.findById(req.params.id);
  res.json({ msg: mesa });
};

procesoCtrl.updateProcesoElectoral = async (req, res) => {
  try {
    const procesosAbiertos = await procesoElectoralModel.aggregate([
      { $group: { _id: "$estado", id: { $push: "$_id" } } },
    ]);

    for (let i = 0; i < procesosAbiertos.length; i++) {
      if (procesosAbiertos[i]._id) {
        procesosAbiertos[i].id.map(async (res) => {
          console.log(res);
          await procesoElectoralModel.findByIdAndUpdate(res, { estado: false });
        });
      }
    }

    res.send({ msg: "Editado" });
  } catch (e) {
    console.log(e);
  }
};

procesoCtrl.deleteProcesoElectoral = async (req, res) => {
  // Eliminando la coleccion mesas
  const mesas = await mesaModel.find();
  if (mesas.length > 0) mesaModel.collection.drop();

  // Eliminando la coleccion Frentes
  const frentes = await frenteModel.find();
  if (frentes.length > 0) frenteModel.collection.drop();

  // Eliminando la coleccion votantes
  const votantes = await votanteModels.find();
  if (votantes.length > 0) votanteModels.collection.drop();

  // Eliminando la coleccion procesoElectoral
  const procesos = await procesoElectoralModel.find();
  if (procesos.length > 0) procesoElectoralModel.collection.drop();

  // Eliminando a todos los universitarios menos a los administradores
  const universitarios = await universitarioModels.find();
  const universitarioNoAdministradores = universitarios.filter(
    (res) =>
      crypto.AES.decrypt(res.cargo, "palabraClave").toString(
        crypto.enc.Utf8
      ) !== "Administrador"
  );
  universitarioNoAdministradores.map(
    async (res) => await universitarioModels.findByIdAndDelete(res._id)
  );
};

module.exports = procesoCtrl;
