const authCtrl = {};
const Universitarios = require("../models/universitarioModels");
const jwt = require("jsonwebtoken");
const bcryptjs = require("bcryptjs");
const crypto = require("crypto-js");

authCtrl.autenticarUsuario = async (req, res) => {
  const { cu, password } = req.body;
  try {
    let universitarios = await Universitarios.find();

    let universitario = universitarios.filter(
      (res) =>
        crypto.AES.decrypt(res.cu, "palabraClave").toString(crypto.enc.Utf8) ===
        cu
    );
    // let universitario = await Universitarios.findOne({ cu });
    if (universitario.length < 1) {
      return res.status(400).json({ msg: "El Universitario no existe" });
    }
    universitario = {
      id: universitario[0].id,
      nombre: crypto.AES.decrypt(
        universitario[0].nombre,
        "palabraClave"
      ).toString(crypto.enc.Utf8),
      apellidos: crypto.AES.decrypt(
        universitario[0].apellidos,
        "palabraClave"
      ).toString(crypto.enc.Utf8),
      cu: crypto.AES.decrypt(universitario[0].cu, "palabraClave").toString(
        crypto.enc.Utf8
      ),
      carrera: crypto.AES.decrypt(
        universitario[0].carrera,
        "palabraClave"
      ).toString(crypto.enc.Utf8),
      cargo: crypto.AES.decrypt(
        universitario[0].cargo,
        "palabraClave"
      ).toString(crypto.enc.Utf8),
      password: universitario[0].password,
    };

    const passCorrecto = await bcryptjs.compare(
      password,
      universitario.password
    );
    if (!passCorrecto) {
      return res.status(400).json({ msg: "Password Incorrecto" });
    }
    const payload = {
      usuario: {
        id: universitario.id,
      },
    };
    jwt.sign(
      payload,
      process.env.SECRETA,
      {
        expiresIn: 3600,
      },
      (error, token) => {
        if (error) throw error;
        res.json({ token });
      }
    );
  } catch (error) {
    console.log(error);
  }
};

// Obtiene que usuario esta autenticado
authCtrl.usuarioAutenticado = async (req, res) => {
  try {
    const usuario = await Universitarios.findById(req.universitario.id).select(
      "-password"
    );
    const user = {
      id: usuario._id,
      nombre: crypto.AES.decrypt(usuario.nombre, "palabraClave").toString(
        crypto.enc.Utf8
      ),
      apellidos: crypto.AES.decrypt(usuario.apellidos, "palabraClave").toString(
        crypto.enc.Utf8
      ),
      cu: crypto.AES.decrypt(usuario.cu, "palabraClave").toString(
        crypto.enc.Utf8
      ),
      ci: crypto.AES.decrypt(usuario.ci, "palabraClave").toString(
        crypto.enc.Utf8
      ),
      carrera: crypto.AES.decrypt(usuario.carrera, "palabraClave").toString(
        crypto.enc.Utf8
      ),
      cargo: crypto.AES.decrypt(usuario.cargo, "palabraClave").toString(
        crypto.enc.Utf8
      ),
    };
    res.json({ user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Hubo un error" });
  }
};

module.exports = authCtrl;
