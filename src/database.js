const mongoose = require("mongoose");

const URI = process.env.MONGODB_URI
  ? process.env.MONGODB_URI
  : "mongodb://localhost/databasetest";

// Conectar a mongoDB
mongoose.connect(URI, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true
});

const connection = mongoose.connection;

// Mensaje si se conecta correctamente a MongoDB
connection.once("open", () => {
  console.log("DB is connected");
});
