const consultaCtrl = {};
const universitarioModel = require("../models/universitarioModels");

// OBTIENE A UN UNIVERSITARIO POR CARNET UNIVERSITARIO
consultaCtrl.getUniversitarioCU = async (req, res) => {
  const universitario = await universitarioModel.findOne({ cu: req.params.cu });
  res.json({ msg: universitario });
};

module.exports = consultaCtrl;
