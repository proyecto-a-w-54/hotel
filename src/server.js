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
    password: '123456789', // Cambia esto por tu contraseña de MySQL
    database: 'dbpa' // Asegúrate de que el nombre de la base de datos sea correcto
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
    const { name, lastName, email, password } = req.body;
    
    // Validación de datos
    if (!name || !lastName || !email || !password) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    // Verificar si el correo ya está registrado
    const emailCheckQuery = 'SELECT * FROM Cliente WHERE Correo = ?';
    connection.query(emailCheckQuery, [email], async (err, results) => {
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
            const hashedPassword = await bcrypt.hash(password, 10);

            const query = 'INSERT INTO Cliente (Nombre, Apellido, Correo, Contrasena) VALUES (?, ?, ?, ?)';
            connection.query(query, [name, lastName, email, hashedPassword], (err, results) => {
                if (err) {
                    console.error('Error al registrar cliente:', err);
                    return res.status(500).json({ message: 'Error al registrar cliente' });
                } else {
                    return res.status(200).json({ message: 'Cliente registrado con éxito' });
                }
            });
        }
    });
});

app.get('/api/profile', (req, res) => {
    if (req.session.usuarioLogueado) {
        const userId = req.session.userId;
        connection.query('SELECT Nombre, Apellido, Correo FROM Cliente WHERE ID_Cliente = ?', [userId], (err, results) => {
            if (err) {
                console.error('Error al obtener perfil:', err);
                return res.status(500).json({ message: 'Error al obtener perfil' });
            }
            if (results.length > 0) {
                const { Nombre, Apellido, Correo } = results[0];
                return res.status(200).json({ Nombre, Apellido, Correo });
            } else {
                return res.status(404).json({ message: 'Perfil no encontrado' });
            }
        });
    } else {
        return res.status(401).json({ message: 'No se ha iniciado sesión' });
    }
});


app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    // Consultar la base de datos para obtener el ID_Cliente con el correo electrónico proporcionado
    connection.query('SELECT ID_Cliente, Contrasena FROM Cliente WHERE Correo = ?', [email], (err, results) => {
        if (err) {
            console.error('Error al buscar usuario:', err);
            return res.status(500).json({ message: 'Error al iniciar sesión' });
        }

        // Verificar si se encontró un usuario con el correo electrónico proporcionado
        if (results.length === 0) {
            return res.status(401).json({ message: 'Usuario no encontrado' });
        }

        // Guardar el ID_Cliente en la sesión
        req.session.userId = results[0].ID_Cliente;

        // Imprimir el ID_Cliente en la consola
        console.log('ID de usuario:', req.session.userId);

        const hashedPassword = results[0].Contrasena;

        if (!hashedPassword) {
            return res.status(500).json({ message: 'Contraseña no encontrada en la base de datos' });
        }
        
        bcrypt.compare(password, hashedPassword, (err, result) => {
            if (result) {
                // La contraseña es correcta, establecer la sesión
                req.session.usuarioLogueado = true;
                
                // Enviar el userId en la respuesta
                return res.status(200).json({ 
                    message: 'Inicio de sesión exitoso', 
                    userId: req.session.userId
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
    const { fechaInicio, fechaFin, numPersonas, tipoHabitacion, userID } = req.body;

    console.log("Datos de la reserva recibidos:", req.body);

    // Obtener el servicio correspondiente al tipo de habitación
    let servicio;
    if (tipoHabitacion === 'Estándar') {
        servicio = 'Servicio tipo A'; // Inserta aquí el servicio correspondiente a la habitación estándar
    } else if (tipoHabitacion === 'Deluxe') {
        servicio = 'Servicio tipo B'; // Inserta aquí el servicio correspondiente a la habitación deluxe
    } else if (tipoHabitacion === 'Viajero') {
        servicio = 'Servicio tipo C'; // Inserta aquí el servicio correspondiente a la habitación viajero
    }

    // Insertar la reserva en la tabla Reserva
    const reservaQuery = 'INSERT INTO Reserva (Fecha_Inicio, Fecha_Fin, ID_Cliente, N_Personas) VALUES (?, ?, ?, ?)';
    connection.query(reservaQuery, [fechaInicio, fechaFin, userID, numPersonas], (err, results) => {
        if (err) {
            console.error('Error al registrar reserva:', err);
            res.status(500).json({ message: 'Error al registrar reserva' });
        } else {
            // Obtener el ID de la reserva recién insertada
            const reservaId = results.insertId;

            // Insertar la habitación reservada en la tabla Habitación
            const habitacionQuery = 'INSERT INTO Habitación (Tipo_Habitación, ID_Reserva, N_Servicio) VALUES (?, ?, ?)';
            connection.query(habitacionQuery, [tipoHabitacion, reservaId, servicio], (err, results) => {
                if (err) {
                    console.error('Error al registrar habitación:', err);
                    res.status(500).json({ message: 'Error al registrar habitación' });
                } else {
                    console.log("Tipo de habitación de la reserva:", tipoHabitacion);
                    res.status(200).json({ message: 'Reserva registrada con éxito' });
                }
            });
        }
    });
});

app.get('/api/reservas/:userID', (req, res) => {
    const userID = req.params.userID;

    console.log("Solicitud para obtener reservas del usuario con ID:", userID);

    const query = `
        SELECT Reserva.Fecha_Inicio, Reserva.Fecha_Fin, Habitación.Tipo_Habitación 
        FROM Reserva 
        JOIN Habitación ON Reserva.ID_Reserva = Habitación.ID_Reserva 
        WHERE Reserva.ID_Cliente = ?
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

    const query = 'SELECT Tipo_Habitación FROM Habitación WHERE ID_Reserva = ?';

    connection.query(query, [reservaId], (err, results) => {
        if (err) {
            console.error('Error al obtener tipo de habitación:', err);
            res.status(500).json({ message: 'Error al obtener tipo de habitación' });
        } else {
            if (results.length > 0) {
                const tipoHabitacion = results[0].Tipo_Habitación;
                res.status(200).json({ tipoHabitacion: tipoHabitacion });
            } else {
                res.status(404).json({ message: 'No se encontró tipo de habitación para la reserva' });
            }
        }
    });
});




// Ruta para obtener las reservas del usuario
app.get('/api/reservas', (req, res) => {
    const userID = req.session.userId;
    const query = 'SELECT * FROM Reserva WHERE ID_Cliente = ?';
    connection.query(query, [userID], (err, results) => {
        if (err) {
            console.error('Error al obtener las reservas:', err);
            res.status(500).json({ message: 'Error al obtener las reservas' });
        } else {
            res.status(200).json(results);
        }
    });
});


app.listen(port, () => {
    console.log(`Servidor ejecutándose en http://localhost:${port}`);
});
