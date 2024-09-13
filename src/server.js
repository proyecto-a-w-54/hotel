const bodyParser = require('body-parser');
const mysql = require('mysql2');
const path = require('path');
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const app = express();
const port = 3000; // Asegúrate de que el puerto es 3000

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Configurar el middleware de express-session
app.use(session({
    secret: 'secreto_muy_seguro', // Cambia esto por una cadena de caracteres segura
    resave: false,
    saveUninitialized: true, // Permite crear sesiones sin que tengan datos
    cookie: { secure: false } // Cambia a true en producción con HTTPS
}));

// Middleware para verificar el estado de sesión del usuario
app.use((req, res, next) => {
    if (req.session.usuarioLogueado) {
        res.locals.usuarioLogueado = true;
    } else {
        res.locals.usuarioLogueado = false;
    }
    next();
});

// Configuración de la base de datos
const dbConfig = {
    host: 'localhost',
    user: 'root', // Cambia esto por tu usuario de MySQL
    password: '12345', // Cambia esto por tu contraseña de MySQL
    database: 'BD_Proaula' // Asegúrate de que el nombre de la base de datos sea correcto
};

const connection = mysql.createConnection(dbConfig);

// Conectar a la base de datos
connection.connect(err => {
    if (err) {
        console.error('Error al conectar con la base de datos:', err);
    } else {
        console.log('Conexión a la base de datos exitosa');
    }
});

// Ruta para registrar un cliente
app.post('/api/register', async (req, res) => {
    const { nombre, apellido, correo_electronico, contrasena } = req.body;

    // Validación de datos
    if (!nombre || !apellido || !correo_electronico || !contrasena) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    // Verificar si el correo ya está registrado
    const emailCheckQuery = 'SELECT * FROM Usuario WHERE correo_electronico = ?';
    connection.query(emailCheckQuery, [correo_electronico], async (err, results) => {
        if (err) {
            console.error('Error al verificar el correo:', err);
            return res.status(500).json({ message: 'Error en el servidor' });
        }

        if (results.length > 0) {
            // Si el correo ya está registrado, enviar un mensaje de error
            return res.status(400).json({ message: 'El correo ya está en uso' });
        } else {
            // Si el correo no está registrado, proceder con el registro

            // Hash de la contraseña
            try {
                const hashedPassword = await bcrypt.hash(contrasena, 10);

                const query = 'INSERT INTO Usuario (nombre, apellido, correo_electronico, contrasena) VALUES (?, ?, ?, ?)';
                connection.query(query, [nombre, apellido, correo_electronico, hashedPassword], (err, results) => {
                    if (err) {
                        console.error('Error al registrar usuario:', err);
                        return res.status(500).json({ message: 'Error al registrar usuario' });
                    } else {
                        return res.status(200).json({ message: 'Usuario registrado con éxito' });
                    }
                });
            } catch (error) {
                console.error('Error al hacer hash de la contraseña:', error);
                return res.status(500).json({ message: 'Error al registrar usuario' });
            }
        }
    });
});

app.get('/api/profile', (req, res) => {
    if (req.session.usuarioLogueado) {
        const userId = req.session.userId;
        connection.query('SELECT nombre, apellido, correo_electronico FROM Usuario WHERE id_usuario = ?', [userId], (err, results) => {
            if (err) {
                console.error('Error al obtener perfil:', err);
                return res.status(500).json({ message: 'Error al obtener perfil' });
            }
            if (results.length > 0) {
                const { nombre, apellido, correo_electronico } = results[0];
                return res.status(200).json({ nombre, apellido, correo_electronico });
            } else {
                return res.status(404).json({ message: 'Perfil no encontrado' });
            }
        });
    } else {
        return res.status(401).json({ message: 'No se ha iniciado sesión' });
    }
});
// Ruta para iniciar sesión
app.post('/api/login', (req, res) => {
    const { correo_electronico, contrasena } = req.body;

    // Consultar la base de datos para obtener el usuario con el correo electrónico proporcionado
    connection.query('SELECT id_usuario, contrasena, nombre, apellido FROM Usuario WHERE correo_electronico = ?', [correo_electronico], (err, results) => {
        if (err) {
            console.error('Error al buscar usuario:', err);
            return res.status(500).json({ message: 'Error en el servidor' });
        }

        // Verificar si se encontró un usuario con el correo electrónico proporcionado
        if (results.length === 0) {
            return res.status(401).json({ message: 'Usuario no encontrado' });
        }

        const user = results[0];
        const hashedPassword = user.contrasena;

        // Comparar la contraseña proporcionada con la almacenada en la base de datos
        bcrypt.compare(contrasena, hashedPassword, (err, result) => {
            if (err) {
                console.error('Error al comparar contraseñas:', err);
                return res.status(500).json({ message: 'Error en el servidor' });
            }

            if (result) {
                // La contraseña es correcta, establecer la sesión
                req.session.userId = user.id_usuario;
                req.session.usuarioLogueado = true;

                // Enviar el userId y los datos del usuario en la respuesta
                return res.status(200).json({
                    message: 'Inicio de sesión exitoso',
                    userId: req.session.userId,
                    nombre: user.nombre,
                    apellido: user.apellido
                });
            } else {
                // La contraseña es incorrecta, enviar una respuesta de error
                return res.status(401).json({ message: 'Credenciales inválidas' });
            }
        });
    });
});

// Ruta para cerrar sesión
app.post('/api/logout', (req, res) => {
    // Eliminar la propiedad usuarioLogueado de la sesión
    delete req.session.usuarioLogueado;
    req.session.destroy(); // Destruir la sesión
    return res.status(200).json({ message: 'Sesión cerrada exitosamente' });
});

// Ruta para registrar una reserva
app.post('/api/reserve', (req, res) => {
    const { fecha_entrada, fecha_salida, numero_personas, id_habitacion, id_usuario } = req.body;

    console.log("Datos de la reserva recibidos:", req.body);

    // Insertar la reserva en la tabla Reserva
    const reservaQuery = 'INSERT INTO Reserva (id_usuario, id_habitacion, fecha_entrada, fecha_salida, numero_personas) VALUES (?, ?, ?, ?, ?)';
    connection.query(reservaQuery, [id_usuario, id_habitacion, fecha_entrada, fecha_salida, numero_personas], (err, results) => {
        if (err) {
            console.error('Error al registrar reserva:', err);
            return res.status(500).json({ message: 'Error al registrar reserva' });
        } else {
            return res.status(200).json({ message: 'Reserva registrada con éxito' });
        }
    });
});

// Ruta para obtener las reservas del usuario
app.get('/api/reservas/:userID', (req, res) => {
    const userID = req.params.userID;

    console.log("Solicitud para obtener reservas del usuario con ID:", userID);

    const query = `
        SELECT Reserva.fecha_entrada, Reserva.fecha_salida, Habitacion.tipo_habitacion 
        FROM Reserva 
        JOIN Habitacion ON Reserva.id_habitacion = Habitacion.id_habitacion 
        WHERE Reserva.id_usuario = ?
    `;

    connection.query(query, [userID], (err, results) => {
        if (err) {
            console.error('Error al obtener reservas:', err);
            res.status(500).json({ message: 'Error al obtener reservas' });
        } else {
            console.log("Reservas obtenidas:", results);
            res.status(200).json(results);
        }
    });
});

// Ruta para obtener el tipo de habitación de una reserva
app.get('/api/habitacion/:reservaId', (req, res) => {
    const reservaId = req.params.reservaId;

    const query = 'SELECT Habitacion.tipo_habitacion FROM Habitacion JOIN Reserva ON Habitacion.id_habitacion = Reserva.id_habitacion WHERE Reserva.id_reserva = ?';

    connection.query(query, [reservaId], (err, results) => {
        if (err) {
            console.error('Error al obtener tipo de habitación:', err);
            res.status(500).json({ message: 'Error al obtener tipo de habitación' });
        } else {
            if (results.length > 0) {
                const tipoHabitacion = results[0].tipo_habitacion;
                res.status(200).json({ tipoHabitacion: tipoHabitacion });
            } else {
                res.status(404).json({ message: 'No se encontró tipo de habitación para la reserva' });
            }
        }
    });
});

// Ruta para registrar un pago
app.post('/api/payment', (req, res) => {
    const { id_reserva, monto_total, metodo_pago, estado_pago } = req.body;

    // Validación de datos
    if (!id_reserva || !monto_total || !metodo_pago) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    // Insertar el pago en la tabla Pago
    const pagoQuery = 'INSERT INTO Pago (id_reserva, monto_total, metodo_pago, estado_pago) VALUES (?, ?, ?, ?)';
    connection.query(pagoQuery, [id_reserva, monto_total, metodo_pago, estado_pago || 'aprobado'], (err, results) => {
        if (err) {
            console.error('Error al registrar pago:', err);
            return res.status(500).json({ message: 'Error al registrar pago' });
        } else {
            return res.status(200).json({ message: 'Pago registrado con éxito' });
        }
    });
});

// Ruta para registrar una opinión
app.post('/api/opinion', (req, res) => {
    const { id_usuario, id_hotel, calificacion, comentario } = req.body;

    // Validación de datos
    if (!id_usuario || !id_hotel || !calificacion) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    // Insertar la opinión en la tabla Opinion
    const opinionQuery = 'INSERT INTO Opinion (id_usuario, id_hotel, calificacion, comentario) VALUES (?, ?, ?, ?)';
    connection.query(opinionQuery, [id_usuario, id_hotel, calificacion, comentario || null], (err, results) => {
        if (err) {
            console.error('Error al registrar opinión:', err);
            return res.status(500).json({ message: 'Error al registrar opinión' });
        } else {
            return res.status(200).json({ message: 'Opinión registrada con éxito' });
        }
    });
});

app.listen(port, () => {
    console.log(`Servidor ejecutándose en http://localhost:${port}`);
});
