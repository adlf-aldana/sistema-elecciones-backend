const procesoCtrl = {};
const procesoElectoralModel = require("../models/procesoElectoralModel");

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

    // cerrando proceso de todos los que estan en ese proceso
    procesosAbiertos[0].id.map(async (id) => {
      await procesoElectoralModel.findByIdAndUpdate(id, { estado: false });
    });

    res.send({ msg: "Editado" });
  } catch (e) {
    console.log(e);
  }
};

procesoCtrl.deleteProcesoElectoral = async (req, res) => {
  //   try {
  //     console.log(req.params.id);
  //     await mesaModel.findByIdAndDelete(req.params.id);
  //     res.json({ msg: "Mesa Eliminada" });
  //   } catch (error) {
  //     console.log(error);
  //   }
};

module.exports = procesoCtrl;
