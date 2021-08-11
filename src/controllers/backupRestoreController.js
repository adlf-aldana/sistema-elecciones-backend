const backupRestoreCtrl = {};
const { spawn } = require("child_process");
const path = require("path");
const cron = require("node-cron");

const DB_NAME = "sistema_elecciones";
// const DB_NAME = "mongodb+srv://root:System.123@cluster0.n37pc.mongodb.net/sistema_elecciones";
// const ARCHIVE_PATH = path.join(__dirname, `${DB_NAME}.gzip`);

var userName = process.env['USERPROFILE'].split(path.sep)[2];
var loginId = path.join(userName);

// const ARCHIVE_PATH = path.join('C:/Users/'+loginId+'/Desktop/dump/');
const ARCHIVE_PATH = path.join('C:/Users/'+loginId+'/Desktop/', `${DB_NAME}.gzip`);

const ARCHIVE_PATH2 = path.join('C:/Users/'+loginId+'/Desktop/dumb');

// Restaurar Backup
backupRestoreCtrl.getBackup = async (req, res) => {
  const child = spawn("mongorestore", [
    `--db=${DB_NAME}`,
    `--archive=${ARCHIVE_PATH}`,
    "--gzip",
  ]);

  child.stdout.on("data", (data) => {
    console.log("stdout:\n", data);
  });
  child.stderr.on("data", (data) => {
    console.log("stderr:\n", Buffer.from(data).toString());
  });
  child.on("error", (error) => {
    console.log("error:\n", error);
  });
  child.on("exit", (code, signal) => {
    if (code) console.log("Process exit with code:", code);
    else if (signal) console.log("Process killed with signal:", signal);
    else console.log("Restore is successfull ✅");
  });
};

// Crear Backup
backupRestoreCtrl.createBackup = async (req, res) => {
  const child = spawn("mongodump", [
    `--db=${DB_NAME}`,
    `--archive=${ARCHIVE_PATH}`,
    "--gzip",
  ]);

  child.stdout.on("data", (data) => {
    console.log("stdout:\n", data);
  });
  child.stderr.on("data", (data) => {
    console.log("stderr:\n", Buffer.from(data).toString());
  });
  child.on("error", (error) => {
    console.log("error:\n", error);
  });
  child.on("exit", (code, signal) => {
    if (code) console.log("Process exit with code:", code);
    else if (signal) console.log("Process killed with signal:", signal);
    else console.log("Backup is successfull ✅");
  });
};

// // OBTIENE A UN UNIVERSITARIO POR ID
// backupRestoreCtrl.getUniversitario = async (req, res) => {
// };

// // ACTUALIZA UN UNIVERSITARIO POR ID
// backupRestoreCtrl.updateUniversitario = async (req, res) => {
// };

// // ELIMINA A UN UNIVERSITARIO POR ID
// backupRestoreCtrl.deleteUniversitario = async (req, res) => {
// };

module.exports = backupRestoreCtrl;
