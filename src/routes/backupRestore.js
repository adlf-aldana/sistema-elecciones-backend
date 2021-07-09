const { Router } = require("express");
const router = Router();
const {
    getBackup,
    createBackup,
} = require("../controllers/backupRestoreController");

router.route("/")
  .get(getBackup)
  .post(createBackup);

// router
//   .route("/:id")
//   .get(getUniversitario)
//   .put(updateUniversitario)
//   .delete(deleteUniversitario);

module.exports = router;
