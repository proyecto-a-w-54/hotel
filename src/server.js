const express = require('express');
const bodyParser = require('body-parser');
const sql = require('mssql');
const path = require('path');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Configuración de la base de datos
const dbConfig = {
    server: 'DESKTOP-QCKAV28\SQLEXPRESS', // Puedes usar 'localhost\\instancia' si usas una instancia nombrada
    database: 'Proaula',
    options: {
        encrypt: true, // Usa esta opción si estás en Azure
        trustServerCertificate: true // Usa esta opción para desarrollo local
    }
};

// Conectar a la base de datos
sql.connect(dbConfig, err => {
    if (err) {
        console.error('Error al conectar con la base de datos:', err);
    } else {
        console.log('Conexión a la base de datos exitosa');
    }
});

// Ruta para obtener datos de habitaciones
app.get('/api/habitaciones', async (req, res) => {
    try {
        const result = await sql.query`SELECT * FROM Habitaciones`;
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
});

app.listen(port, () => {
    console.log(`Servidor ejecutándose en http://localhost:${port}`);
});
