const votanteCtrl = {};
const votanteModels = require("../models/votanteModels");

const Web3 = require("web3");
const TruffleContract = require("truffle-contract");
// const JSONvotacion = require("../../../build2/contracts/votacion");
const JSONvotacion = require("../../../sistema_elecciones/build2/contracts/votacion.json");

Web3.providers.HttpProvider.prototype.sendAsync =
  Web3.providers.HttpProvider.prototype.send;
const web3Provider = new Web3.providers.HttpProvider("http://127.0.0.1:8545");
const web3 = new Web3(Web3.givenProvider || "http://127.0.0.1:8545");

// OBTIENE A LOS VOTANTES
votanteCtrl.getVotantes = async (req, res) => {
  try {
    const votantes = await votanteModels.find();

    const cantPartido = await votanteModels.aggregate([
      { $group: { _id: "$_idFrente", total: { $sum: 1 } } },
    ]);
    res.json({ votantes, cantPartido });
  } catch (error) {
    return res
      .status(400)
      .json({ msg: "No se tiene acceso a la base de datos" });
  }
};

// GUARDANDO NUEVO VOTANTE
votanteCtrl.createVotante = async (req, res) => {
  const { cu } = req.body;

  try {
    let votante = await votanteModels.findOne({ cu });
    if (votante) {
      if (votante.encargadoMesa && votante.verificadorVotante) {
        return res.status(400).json({ msg: "Error: El universitario ya votó" });
      } else if (
        votante.encargadoMesa &&
        votante.verificadorVotante === false
      ) {
        return res.status(400).json({
          msg: "En espera: Falta la habilitación del verificador de votante",
        });
      }
    }

    const verificarUltimoVotante = await votanteModels
      .find()
      .sort({ $natural: -1 })
      .limit(1);
    if (
      verificarUltimoVotante[0] &&
      !verificarUltimoVotante[0].verificadorVotante
    ) {
      return res.status(400).json({
        msg: "Espere, Por favor... Verificador aún no confirmo al último votante",
      });
    }
    votante = new votanteModels(req.body);
    await votante.save();
    res.send({ msg: "Votante Guardado" });
  } catch (error) {
    res.status(400).json({ msg: "Hubo un error al crear un nuevo votante" });
  }
};

// OBTIENE VOTANTE POR CU
votanteCtrl.getVotante = async (req, res) => {
  try {
    const votante = await votanteModels.findOne({ cu: req.params.id });
    if (!votante) {
      return res.status(400).json({ msg: "Aún no esta habilitado para votar" });
    }
    res.json({ votante });
  } catch (error) {
    res.status(400).json({ msg: "Hubo un error al obtener a un vontante" });
  }
};

// ELIMINA A UN VOTANTE
votanteCtrl.deleteVotante = async (req, res) => {
  try {
    await votanteModels.findByIdAndDelete(req.params.id);
    res.json({ msg: "Votante Eliminado" });
  } catch (error) {
    res.status(400).json({ msg: "Hubo un error al eliminar a votante" });
  }
};

// OBTIENE ULTIMO VOTANTE
votanteCtrl.getUltimoVotante = async (req, res) => {
  try {
    const votante = await votanteModels.find().sort({ $natural: -1 }).limit(1);
    res.json({ votante });
  } catch (error) {
    res.status(400).json({ msg: "Hubo un error al obtener el ultimo votante" });
  }
};

votanteCtrl.updateVotante = async (req, res) => {
  if (req.body._idFrente) {
    const truffle = TruffleContract(JSONvotacion);
    truffle.setProvider(web3Provider);
    const votacion = await truffle.deployed();
    const accounts = await web3.eth.getAccounts();
    const account = accounts[0];
    await votacion.createTask(req.body.cu, req.body._idFrente, "20/02/2020", {
      from: account,
      gas: 3000000,
    });
  }
  try {
    const votante = await votanteModels.findByIdAndUpdate(
      req.params.id,
      req.body
    );
    res.json(votante);
  } catch (error) {
    res.status(400).json({ msg: "Hubo un error al Actualizar" });
  }
};

module.exports = votanteCtrl;
