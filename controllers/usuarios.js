const { response } = require("express");
const bcrypt = require("bcryptjs");
const Usuario = require("../models/usuario");
const { generarJWT } = require("../helpers/jwt");

const getUsuarios = async (req, res) => {
  const usuario = await Usuario.find();

  res.json({
    ok: true,
    usuario,
    uid: req.uid
  });
};

const crearUsuarios = async (req, res = response) => {
  const { email, password } = req.body;

  try {
    const existeEmail = await Usuario.findOne({ email });

    if (existeEmail) {
      return res.status(400).json({
        ok: false,
        msg: "El correo ya esta registrado",
      });
    }

    const usuario = new Usuario(req.body);

    //Encriptar contraseña
    const salt = bcrypt.genSaltSync();

    usuario.password = bcrypt.hashSync(password, salt);

    //Guardar usuario
    await usuario.save();

    //Generar el token
    const token = await generarJWT(usuario.id);

    res.json({
      ok: true,
      usuario,
      token
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      ok: false,
      msg: "Error inesperado... revisar logs",
    });
  }
};

const actualizarUsuario = async (req, res = response) => {
  const uid = req.params.id;
  try {
    //TODO Validar token y comprobar si es el usuario correcto

    const usuarioDB = await Usuario.findById(uid);

    if (!usuarioDB) {
      return res.status(404).json({
        ok: false,
        msg: "No existe un usuario por ese id",
      });
    }

    // Actualizaciones
    const { password, google, email, ...campos } = req.body;

    if (usuarioDB.email !== email) {
      const existeEmail = await Usuario.findOne({ email });
      if (existeEmail) {
        return res.status(400).json({
          ok: false,
          msg: "Ya esiste un usuario con ese email",
        });
      }
    }

    campos.email = email;

    const usuarioActulizado = await Usuario.findByIdAndUpdate(uid, campos, {
      new: true,
    });

    res.json({
      ok: true,
      usuario: usuarioActulizado,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      ok: false,
      msg: "Error inesperado",
    });
  }
};

const borrarUsuario = async (req, res = response) => {
  const uid = req.params.id;
  try {
    const usuarioDB = await Usuario.findById(uid);

    if (!usuarioDB) {
      return res.status(404).json({
        ok: false,
        msg: "No existe un usuario por ese id",
      });
    }

    await Usuario.findByIdAndDelete(uid);

    res.status(200).json({
      ok: true,
      msg: "Usuario eliminado",
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      ok: false,
      msg: "Error inesperado",
    });
  }
}

module.exports = {
  getUsuarios,
  crearUsuarios,
  actualizarUsuario,
  borrarUsuario
};
