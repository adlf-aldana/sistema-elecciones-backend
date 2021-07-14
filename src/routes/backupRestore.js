const { Router } = require("express");
const router = Router();
const {
    getBackup,
    createBackup,
} = require("../controllers/backupRestoreController");

router.route("/")
  .get(getBackup)
  .post(createBackup);

module.exports = router;
