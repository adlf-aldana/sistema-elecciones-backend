const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");

// settings
// app.set("port", process.env.PORT || 4000);

// // middlewares
// app.use(cors());
// app.use(express.json());
// app.use(express.static(path.join(__dirname, "/../public")));

// // routes
// app.use("/api/lista_estudiantes", require("./routes/universitarios"));
// app.use("/api/frente_universitario", require("./routes/frente_universitario"));
// app.use(
//   "/api/consulta_universitario_cu",
//   require("./routes/consulta_universitario")
// );
// app.use("/api/auth", require("./routes/auth"));
// app.use("/api/votante", require("./routes/votante"));
// app.use("/api/consultaVotante", require("./routes/consultasVotante"));

module.exports = app;
