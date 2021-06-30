const { Router } = require("express");
const router = Router();
const { getUltimoVotante } = require("../controllers/votanteController");

router.route("/").get(getUltimoVotante);

module.exports = router;
