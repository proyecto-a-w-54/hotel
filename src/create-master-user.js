const bcrypt = require('bcrypt');
const mysql = require('mysql2'); // Cambiado de 'mysql' a 'mysql2'

// Configura tu conexión a la base de datos
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '12345',
    database: 'BD_Proaula'
});

connection.connect((err) => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err);
        return;
    }
    console.log('Conectado a la base de datos');

    // Encriptar la contraseña
    const password = '12345';
    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            console.error('Error al encriptar la contraseña:', err);
            connection.end();
            return;
        }

        // Insertar el usuario master en la base de datos
        const query = 'INSERT INTO Usuario (nombre, apellido, correo_electronico, contrasena, rol) VALUES (?, ?, ?, ?, ?)';
        const values = ['NombreMaster', 'ApellidoMaster', 'master@gmail.com', hashedPassword, 'master'];

        connection.query(query, values, (err, results) => {
            if (err) {
                console.error('Error al insertar el usuario:', err);
            } else {
                console.log('Usuario master creado con éxito');
            }
            connection.end();
        });
    });
});
