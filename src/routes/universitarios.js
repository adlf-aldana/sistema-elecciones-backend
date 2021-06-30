const { Router } = require("express");
const router = Router();
const {
  getUniversitarios,
  createUniversitario,
  getUniversitario,
  updateUniversitario,
  deleteUniversitario,
} = require("../controllers/universitariosController");
const { check } = require('express-validator')
const auth = require('../middleware/auth')

router.route("/")
  .get(getUniversitarios)
  .post([
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    check('apellidos', 'Los apellidos son obligatorios').not().isEmpty(),
    check('cu', 'El carnet universitario debe tener 6 caracteres').isLength(6),
    check('carrera', 'La carrera es obligatorio').not().isEmpty(),
    check('cargo', 'El cargo es obligatorio').not().isEmpty(),
  ], auth, createUniversitario);
// ], createUniversitario);

router
  .route("/:id")
  .get(getUniversitario)
  .put(updateUniversitario)
  .delete(deleteUniversitario);

module.exports = router;
