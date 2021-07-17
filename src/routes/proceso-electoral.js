const { Router } = require("express");
const router = Router();
const {
  getProcesosElectorales,
  createProcesoElectoral,
  getProcesoElectoral,
  updateProcesoElectoral,
  deleteProcesoElectoral,
} = require("../controllers/procesoElectoralController");

router.route("/").get(getProcesosElectorales).post(createProcesoElectoral).delete(deleteProcesoElectoral);

router.route("/:id").get(getProcesoElectoral).put(updateProcesoElectoral);

module.exports = router;
