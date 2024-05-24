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

// Llenar la tabla Habitación con datos de la base de datos
function llenarTablaHabitacion() {
    // Aquí puedes escribir la lógica para obtener los datos necesarios de la base de datos
    const tiposHabitacion = ['Estándar', 'Deluxe', 'Viajero']; // Ejemplo de tipos de habitación
    const servicios = ['Servicio A', 'Servicio B', 'Servicio C']; // Ejemplo de servicios

    // Insertar datos en la tabla Habitación
    tiposHabitacion.forEach(tipo => {
        servicios.forEach(servicio => {
            const query = 'INSERT INTO Habitación (Tipo_Habitación, N_Servicio) VALUES (?, ?)';
            connection.query(query, [tipo, servicio], (err, results) => {
                if (err) {
                    console.error('Error al insertar datos en la tabla Habitación:', err);
                } else {
                    console.log('Datos insertados en la tabla Habitación:', results);
                }
            });
        });
    });
}

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

// Ruta para manejar el inicio de sesión
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    // Consultar la base de datos para obtener el usuario con el correo electrónico proporcionado
    connection.query('SELECT * FROM Cliente WHERE Correo = ?', [email], (err, results) => {
        if (err) {
            console.error('Error al buscar usuario:', err);
            return res.status(500).json({ message: 'Error al iniciar sesión' });
        }

        // Verificar si se encontró un usuario con el correo electrónico proporcionado
        if (results.length === 0) {
            return res.status(401).json({ message: 'Usuario no encontrado' });
        }

        // Comparar la contraseña proporcionada con el hash almacenado en la base de datos
        bcrypt.compare(password, results[0].Contrasena, (err, result) => {
            if (err) {
                console.error('Error al comparar contraseñas:', err);
                return res.status(500).json({ message: 'Error al iniciar sesión' });
            }
            
            if (result) {
                // La contraseña es correcta, establecer la sesión
                req.session.usuarioLogueado = true;
                req.session.userId = results[0].ID; // Guardar el ID del usuario en la sesión
                return res.status(200).json({ message: 'Inicio de sesión exitoso', userId: results[0].ID, userName: results[0].Nombre, userLastName: results[0].Apellido, userEmail: results[0].Correo });
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
    const { fechaInicio, fechaFin, numPersonas, tipoHabitacion } = req.body;
    const userId = req.session.userId; // Obtener el ID del cliente de la sesión

    // Obtener el servicio correspondiente al tipo de habitación
    let servicio;
    if (tipoHabitacion === 'Estándar') {
        servicio = 'Servicio A'; // Inserta aquí el servicio correspondiente a la habitación estándar
    } else if (tipoHabitacion === 'Deluxe') {
        servicio = 'Servicio B'; // Inserta aquí el servicio correspondiente a la habitación deluxe
    } else if (tipoHabitacion === 'Viajero') {
        servicio = 'Servicio C'; // Inserta aquí el servicio correspondiente a la habitación viajero
    }

    // Insertar la reserva en la tabla Reserva
    const reservaQuery = 'INSERT INTO Reserva (Fecha_Inicio, Fecha_Fin, ID_Cliente, N_Personas) VALUES (?, ?, ?, ?)';
    connection.query(reservaQuery, [fechaInicio, fechaFin, userId, numPersonas], (err, results) => {
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
                    res.status(200).json({ message: 'Reserva registrada con éxito' });
                }
            });
        }
    });
});

// Ruta para obtener datos de reservas
app.get('/api/reservas', (req, res) => {
    connection.query('SELECT * FROM Reserva', (err, results) => {
        if (err) {
            res.status(500).send({ message: err.message });
        } else {
            res.json(results);
        }
    });
});

app.listen(port, () => {
    console.log(`Servidor ejecutándose en http://localhost:${port}`);
});
