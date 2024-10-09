const bodyParser = require('body-parser');
const mysql = require('mysql2');
const multer = require('multer');
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
app.use(express.static('src/public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/usuario/index.html')); // Cambiar aquí para mostrar index.html
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/admin/admin.html'));
});

app.get('/usuario', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/usuario/index.html'));
});
app.get('/administrador', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/administrador/administrador.html'));
});

// Configurar el middleware de express-session
app.use(session({
    secret: 'tu_clave_secreta',
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 // Mantener la sesión durante 24 horas
    }
}));

// Configura multer para el almacenamiento de archivos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, 'uploads'));
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Sirve archivos estáticos desde la carpeta 'uploads'
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


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

// Endpoint para obtener la lista de habitaciones
app.get('/api/habitaciones', (req, res) => {
    connection.query('SELECT * FROM Habitacion', (err, results) => {
        if (err) {
            res.status(500).json({ success: false, message: 'Error al obtener habitaciones' });
            return;
        }
        res.json({ success: true, habitaciones: results });
    });
});

// Endpoint para agregar una habitación (incluye imagen)
app.post('/api/habitaciones', upload.single('imagen'), (req, res) => {
    const { nombre, tipo_habitacion, descripcion, precio_por_noche, estado_disponibilidad } = req.body;
    const imagen = req.file ? req.file.filename : null;

    // Verificar si todos los campos requeridos están presentes
    if (!nombre || !tipo_habitacion || !descripcion || !precio_por_noche || !estado_disponibilidad) {
        return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios.' });
    }

    // Inserción en la base de datos
    const query = `
        INSERT INTO Habitacion (nombre, tipo_habitacion, descripcion, precio_por_noche, estado_disponibilidad, imagen_url)
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    const values = [nombre, tipo_habitacion, descripcion, precio_por_noche, estado_disponibilidad, imagen];

    connection.query(query, values, (err, results) => {
        if (err) {
            console.error('Error al insertar la habitación:', err);
            return res.status(500).json({ success: false, message: 'Error al agregar habitación' });
        }
        res.json({ success: true, message: 'Habitación agregada exitosamente' });
    });
});


// Endpoint para obtener una habitación por su ID
app.get('/api/habitaciones/:id', (req, res) => {
    const id = req.params.id;

    connection.query('SELECT * FROM Habitacion WHERE id_habitacion = ?', [id], (err, results) => {
        if (err) {
            res.status(500).json({ success: false, message: 'Error al obtener la habitación' });
            return;
        }

        if (results.length === 0) {
            res.status(404).json({ success: false, message: 'Habitación no encontrada' });
            return;
        }

        res.json({ success: true, habitacion: results[0] });
    });
});


// Endpoint para actualizar una habitación
app.put('/api/habitaciones/:id', (req, res) => {
    const id = req.params.id;
    const { nombre, tipo_habitacion, descripcion, precio_por_noche, estado_disponibilidad, imagen_url } = req.body;

    const query = `
    UPDATE Habitacion 
    SET nombre = ?, tipo_habitacion = ?, descripcion = ?, precio_por_noche = ?, estado_disponibilidad = ? 
    ${imagen_url ? ', imagen_url = ?' : ''}
    WHERE id_habitacion = ?
`;
const values = [nombre, tipo_habitacion, descripcion, precio_por_noche, estado_disponibilidad];
if (imagen_url) values.push(imagen_url);
values.push(id);

connection.query(query, values, (err, results) => {
    if (err) {
        res.status(500).json({ success: false, message: 'Error al actualizar habitación' });
        return;
    }
    res.json({ success: true, message: 'Habitación actualizada con éxito' });
});
});

// Endpoint para eliminar una habitación
app.delete('/api/habitaciones/:id', (req, res) => {
    const id = req.params.id;

    connection.query('DELETE FROM Habitacion WHERE id_habitacion = ?', [id], (err, results) => {
        if (err) {
            res.status(500).json({ success: false, message: 'Error al eliminar habitación' });
            return;
        }
        res.json({ success: true, message: 'Habitación eliminada con éxito' });
    });
});

app.post('/api/register', async (req, res) => {
    const { nombre, apellido, correo_electronico, contrasena, telefono } = req.body; // Añadir el campo de teléfono

    // Validación de datos
    if (!nombre || !apellido || !correo_electronico || !contrasena || !telefono) {
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
            return res.status(400).json({ message: 'El correo ya está en uso' });
        } else {
            try {
                const hashedPassword = await bcrypt.hash(contrasena, 10);

                const query = 'INSERT INTO Usuario (nombre, apellido, correo_electronico, contrasena, telefono) VALUES (?, ?, ?, ?, ?)';
                connection.query(query, [nombre, apellido, correo_electronico, hashedPassword, telefono], (err, results) => {
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
app.post('/api/create-hotel', (req, res) => {
    const { nombre_hotel, descripcion, direccion, categoria } = req.body;

    const query = `INSERT INTO Hotel (nombre_hotel, descripcion, direccion, categoria)
                   VALUES (?, ?, ?, ?)`;

    connection.query(query, [nombre_hotel, descripcion, direccion, categoria], (err, results) => {
        if (err) {
            res.status(500).json({ success: false, message: 'Error al crear hotel' });
            return;
        }
        res.json({ success: true, message: 'Hotel creado con éxito' });
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

app.post('/api/login', (req, res) => {
    const { correo_electronico, contrasena } = req.body;

    // Consultar la base de datos para obtener id_usuario, contrasena y rol del usuario
    connection.query('SELECT id_usuario, contrasena, rol FROM Usuario WHERE correo_electronico = ?', [correo_electronico], (err, results) => {
        if (err) {
            console.error('Error al buscar usuario:', err);
            return res.status(500).json({ message: 'Error al iniciar sesión' });
        }

        if (results.length === 0) {
            return res.status(401).json({ message: 'Usuario no encontrado' });
        }

        const user = results[0];
        const hashedPassword = user.contrasena;

        if (!hashedPassword) {
            return res.status(500).json({ message: 'Contraseña no encontrada en la base de datos' });
        }

        // Comparar la contraseña
        bcrypt.compare(contrasena, hashedPassword, (err, result) => {
            if (result) {
                // Guardar el id_usuario en la sesión
                req.session.userId = user.id_usuario;
                req.session.usuarioLogueado = true;

                // Mostrar el id del usuario que inicia sesión
                console.log(`Usuario logueado: ID Usuario - ${user.id_usuario}`);

                // Lógica para redirigir según el rol del usuario
                if (user.rol === 'master') {
                    // Si el rol es master, redirigir sin buscar id_hotel
                    console.log(`Usuario Master: ID Usuario - ${user.id_usuario}`);
                    return res.status(200).json({
                        message: 'Inicio de sesión exitoso',
                        userId: req.session.userId,
                        redirect: '/admin/admin.html'  // Página para el master
                    });

                } else if (user.rol === 'administrador') {
                    // Si es administrador, obtener id_hotel
                    connection.query('SELECT id_hotel, nombre FROM Hotel INNER JOIN Usuario ON Hotel.id_usuario = Usuario.id_usuario WHERE Usuario.id_usuario = ?', [user.id_usuario], (err, results) => {
                        if (err) {
                            console.error('Error al obtener el hotel:', err);
                            return res.status(500).json({ message: 'Error al obtener hotel' });
                        }
                    
                        if (results.length === 0) {
                            return res.status(403).json({ message: 'No tiene hotel asignado' });
                        }
                    
                        const id_hotel = results[0].id_hotel;
                        const nombre = results[0].nombre; // Obtener el nombre del usuario
                        req.session.id_hotel = id_hotel; // Guardar id_hotel en la sesión
                        req.session.username = nombre; // Guardar el nombre en la sesión
                    
                        // Mostrar el id del usuario y del hotel en la consola
                        console.log(`Usuario Administrador: ID Usuario - ${user.id_usuario}, ID Hotel - ${id_hotel}, Nombre - ${nombre}`);
                    
                        return res.status(200).json({
                            message: 'Inicio de sesión exitoso',
                            userId: req.session.userId,
                            id_hotel: req.session.id_hotel,
                            username: req.session.username, // Incluir el nombre en la respuesta
                            redirect:  '/administrador/administrador.html'  // Página para administradores
                        });
                    });
                } else if (user.rol === 'usuario') {
                    // Si es un usuario normal
                    console.log(`Usuario Normal: ID Usuario - ${user.id_usuario}`);
                    return res.status(200).json({
                        message: 'Inicio de sesión exitoso',
                        userId: req.session.userId,
                        redirect: '/usuario/index.html'   // Página para usuarios normales
                    });
                } else {
                    // Rol no reconocido
                    return res.status(403).json({ message: 'Rol no reconocido' });
                }
            }
        });
    });
});
// Ruta para obtener el nombre de usuario de la sesión
app.get('/api/username', (req, res) => {
    if (req.session.username) {
        res.status(200).json({ username: req.session.username });
    } else {
        res.status(404).json({ message: 'Usuario no autenticado' });
    }
});

// Ruta para verificar si el usuario está logueado
app.get('/api/check-session', (req, res) => {
    if (req.session && req.session.userId) {
        // Si la sesión está activa, devolver true y el ID de usuario
        res.json({ loggedIn: true, userId: req.session.userId });
    } else {
        // Si no hay sesión activa, devolver loggedIn: false
        res.json({ loggedIn: false });
    }
});

app.post('/api/create-admin', (req, res) => {
    const { nombre, apellido, correo_electronico, contrasena, rol, nombre_hotel, descripcion, direccion, categoria } = req.body;

    // Encriptar la contraseña
    bcrypt.hash(contrasena, 10, (err, hashedPassword) => {
        if (err) {
            return res.status(500).json({ message: 'Error al encriptar la contraseña' });
        }

        // Primero crear el hotel
        const hotelQuery = `INSERT INTO Hotel (nombre_hotel, descripcion, direccion, categoria) VALUES (?, ?, ?, ?)`;
        connection.query(hotelQuery, [nombre_hotel, descripcion, direccion, categoria], (err, hotelResult) => {
            if (err) {
                console.error('Error al crear hotel:', err);
                return res.status(500).json({ message: 'Error al crear hotel' });
            }

            const hotelId = hotelResult.insertId;

            // Crear el usuario con el rol de administrador y asignar el hotel creado
            const usuarioQuery = `INSERT INTO Usuario (nombre, apellido, correo_electronico, contrasena, rol) VALUES (?, ?, ?, ?, ?)`;
            connection.query(usuarioQuery, [nombre, apellido, correo_electronico, hashedPassword, rol], (err, userResult) => {
                if (err) {
                    console.error('Error al crear administrador:', err);
                    return res.status(500).json({ message: 'Error al crear administrador' });
                }

                const adminId = userResult.insertId;

                // Relacionar el hotel con el usuario
                const updateHotelQuery = `UPDATE Hotel SET id_usuario = ? WHERE id_hotel = ?`;
                connection.query(updateHotelQuery, [adminId, hotelId], (err, updateResult) => {
                    if (err) {
                        console.error('Error al asignar hotel al administrador:', err);
                        return res.status(500).json({ message: 'Error al asignar hotel al administrador' });
                    }

                    return res.status(200).json({ message: 'Administrador y hotel creados con éxito' });
                });
            });
        });
    });
});


// Ruta para listar administradores
app.get('/api/list-admins', (req, res) => {
    const query = 'SELECT nombre, apellido, correo_electronico FROM Usuario WHERE rol = "administrador"';
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error al listar administradores:', err);
            return res.status(500).json({ message: 'Error al obtener administradores' });
        }
        res.status(200).json({ admins: results });
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