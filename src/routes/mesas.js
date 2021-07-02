const { Router } = require("express");
const router = Router();
const {
  getMesas,
  createMesa,
  getMesa,
  updateMesa,
  deleteMesa,
} = require("../controllers/mesaController");

router.route("/")
  .get(getMesas)
  .post(createMesa);

router
  .route("/:id")
  .get(getMesa)
  .put(updateMesa)
  .delete(deleteMesa);

module.exports = router;
