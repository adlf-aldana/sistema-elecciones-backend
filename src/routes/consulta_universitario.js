const { Router } = require("express");
const router = Router();
const {
  getUniversitarioCU,
} = require("../controllers/universitarioConsultaController");

router.route("/:cu").get(getUniversitarioCU);

module.exports = router;
