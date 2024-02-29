require('dotenv').config();

const express = require('express');
const cors = require('cors');

const { dbConnection } = require('./database/config');

// Crear el servidor de express
const app = express();

//Configuracion CORS
app.use(cors());

//Lectura y parseo del body
app.use(express.json());

//base de datos
dbConnection();

// Rutas
app.use('/api/usuario', require('./routes/usuarios'));
app.use('/api/login', require('./routes/auth'));

app.listen( 3000, () => {
    console.log('servidor corriendo en puerdo '+ process.env.PORT);
} )