const { Router } = require("express");
const router = Router();
const {
  getVotantes,
  createVotante,
  getVotante,
  deleteVotante,
  updateVotante
} = require("../controllers/votanteController");
const auth = require("../middleware/auth");

router.route("/").get(getVotantes).post(auth, createVotante);

router.route("/:id").get(getVotante).put(updateVotante).delete(deleteVotante);

module.exports = router;
