// Importando variables de entorno
require("dotenv").config();

const app = require("./app");
const port = process.env.port || 4000;
// Llamando a database, creación y coneccion a la base de datos mongoDB
require("./database");

// será la encargada de iniciar el programa
async function main() {
  //Inicializando servidor
  app.listen(port, "0.0.0.0", () => {
  console.log(`Server on port ${port}`);
  })
  // await app.listen(app.get("port"), "0.0.0.0");
  // console.log("Server on port ", app.get("port"));
}

main();
