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

// Endpoint para obtener la lista de hoteles
app.get('/api/hoteles', (req, res) => {
    connection.query('SELECT * FROM hotel', (err, results) => {
        if (err) {
            res.status(500).json({ success: false, message: 'Error al obtener hoteles' });
            return;
        }
        res.json({ success: true, hoteles: results });
    });
});

// Endpoint para obtener un hotel específico por ID
app.get('/api/hoteles/:id', (req, res) => {
    const hotelId = req.params.id; // Obtener el ID del hotel de los parámetros de la ruta

    connection.query('SELECT * FROM hotel WHERE id_hotel = ?', [hotelId], (err, results) => {
        if (err) {
            res.status(500).json({ success: false, message: 'Error al obtener el hotel' });
            return;
        }
        
        // Verificar si se encontró el hotel
        if (results.length === 0) {
            res.status(404).json({ success: false, message: 'Hotel no encontrado' });
            return;
        }

        res.json({ success: true, hotel: results[0] }); // Retornar el primer hotel encontrado
    });
});

// Endpoint para agregar una habitación (incluye imagen y id_hotel)
app.post('/api/habitaciones', upload.single('imagen'), (req, res) => {
    const { nombre, tipo_habitacion, descripcion, precio_por_noche, estado_disponibilidad, id_hotel } = req.body;
    const imagen = req.file ? req.file.filename : null;

    // Verificar si todos los campos requeridos están presentes
    if (!nombre || !tipo_habitacion || !descripcion || !precio_por_noche || !estado_disponibilidad || !id_hotel) {
        return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios.' });
    }

    // Inserción en la base de datos con id_hotel
    const query = `
        INSERT INTO Habitacion (nombre, tipo_habitacion, descripcion, precio_por_noche, estado_disponibilidad, imagen_url, id_hotel)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [nombre, tipo_habitacion, descripcion, precio_por_noche, estado_disponibilidad, imagen, id_hotel];

    connection.query(query, values, (err, results) => {
        if (err) {
            console.error('Error al insertar la habitación:', err);
            return res.status(500).json({ success: false, message: 'Error al agregar habitación' });
        }
        res.json({ success: true, message: 'Habitación agregada exitosamente' });
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

app.get('/api/administradores/:id', (req, res) => {
    const adminId = req.params.id;
    connection.query(`
        SELECT u.*, h.nombre AS hotel_nombre, h.descripcion, h.direccion, h.categoria, h.calificacion, h.numero_habitaciones
        FROM Usuario u
        LEFT JOIN Hotel h ON u.id_hotel = h.id_hotel
        WHERE u.id_usuario = ? AND u.rol = 'administrador'
    `, [adminId], (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Error al obtener administrador' });
        }
        if (results.length === 0) {
            return res.status(404).json({ success: false, message: 'Administrador no encontrado' });
        }
        res.json({ success: true, administrador: results[0] });
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
                     // Obtener id_hotel al iniciar sesión
                    connection.query('SELECT id_hotel FROM Hotel WHERE id_usuario = ?', [user.id_usuario], (err, results) => {
                        if (err) {
                            console.error('Error al obtener el hotel:', err);
                            return res.status(500).json({ message: 'Error al obtener hotel' });
                        }

                        if (results.length === 0) {
                            return res.status(403).json({ message: 'No tiene hotel asignado' });
                        }

                        const id_hotel = results[0].id_hotel;
                        req.session.adminId = user.id_usuario; // Guardar el ID del administrador en la sesión
                        req.session.id_hotel = id_hotel; // Guardar el ID del hotel en la sesión

                        return res.status(200).json({
                            message: 'Inicio de sesión exitoso',
                            id_hotel: id_hotel,
                            redirect: '/administrador/administrador.html'
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

// Endpoint para crear administrador y hotel
app.post('/api/create-admin', upload.single('foto'), (req, res) => {
    const { nombre, apellido, correo_electronico, contrasena, rol, nombre_hotel, descripcion, direccion, categoria, telefono, calificacion , numero_personas } = req.body;
    
    const fotoPath = req.file.path; // Ruta de la foto subida

    // Encriptar la contraseña
    bcrypt.hash(contrasena, 10, (err, hashedPassword) => {
        if (err) {
            return res.status(500).json({ message: 'Error al encriptar la contraseña' });
        }

        // Crear el hotel
        const hotelQuery = `INSERT INTO Hotel (nombre_hotel, descripcion, direccion, categoria, calificacion_promedio, numero_habitaciones, foto) VALUES (?, ?, ?, ?, ?, ?, ?)`;
        connection.query(hotelQuery, [nombre_hotel, descripcion, direccion, categoria, calificacion, numero_personas, fotoPath], (err, hotelResult) => {
            if (err) {
                console.error('Error al crear hotel:', err);
                return res.status(500).json({ message: 'Error al crear hotel' });
            }

            const hotelId = hotelResult.insertId;

            // Crear el usuario con el rol de administrador
            const usuarioQuery = `INSERT INTO Usuario (nombre, apellido, correo_electronico, contrasena, rol, telefono) VALUES (?, ?, ?, ?, ?, ?)`;
            connection.query(usuarioQuery, [nombre, apellido, correo_electronico, hashedPassword, rol, telefono], (err, userResult) => {
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
    const query = `
        SELECT U.id_usuario, U.nombre, U.apellido, U.telefono, U.correo_electronico, 
               Ht.numero_habitaciones 
        FROM Usuario U 
        LEFT JOIN Hotel Ht ON Ht.id_usuario = U.id_usuario 
        WHERE U.rol = "administrador"
    `;

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

app.post('/api/reservas', (req, res) => {
    const { id_usuario, id_habitacion, fecha_entrada, fecha_salida, numero_personas, precio_total } = req.body;

    const query = `
        INSERT INTO reserva (id_usuario, id_habitacion, fecha_entrada, fecha_salida, numero_personas, precio_total)
        VALUES (?, ?, ?, ?, ?, ?)`;

    connection.query(query, [id_usuario, id_habitacion, fecha_entrada, fecha_salida, numero_personas, precio_total], (error, results) => {
        if (error) {
            console.error('Error al insertar la reserva:', error);
            return res.status(500).json({ success: false, message: 'Error al confirmar la reserva' });
        }

        res.status(200).json({ success: true, message: 'Reserva confirmada con éxito' });
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
app.post('/api/opiniones', (req, res) => {
    const { id_habitacion, calificacion, comentario, id_usuario } = req.body;

    console.log('ID del usuario recibido en el servidor:', id_usuario); // Verifica que el ID se recibe correctamente

    // Validar la entrada
    if (!calificacion || !comentario) {
        return res.status(400).json({ success: false, message: 'Calificación, comentario y ID de usuario son obligatorios.' });
    }

    // Insertar la opinión
    const query = `INSERT INTO opinion (id_habitacion, id_usuario, calificacion, comentario, fecha_opinion) 
                    VALUES (?, ?, ?, ?, CURDATE())`;

    connection.query(query, [id_habitacion, id_usuario, calificacion, comentario], (error, results) => {
        if (error) {
            console.error('Error al insertar la opinión:', error);
            return res.status(500).json({ success: false, message: 'Error al insertar la opinión' });
        }
        res.status(201).json({ success: true, message: 'Opinión añadida con éxito' });
    });
});


// Ruta para ver las opiniones de una habitación
app.get('/api/opiniones', (req, res) => {
    const habitacionId = req.query.habitacionId;

    // Validar el ID de la habitación
    if (!habitacionId) {
        return res.status(400).json({ success: false, message: 'ID de habitación es obligatorio' });
    }

    console.log("ID de habitación recibido: ", habitacionId);

    const query = `
        SELECT o.comentario, o.calificacion, o.fecha_opinion, u.nombre AS usuario_nombre
        FROM opinion o
        JOIN usuario u ON o.id_usuario = u.id_usuario
        WHERE o.id_habitacion = ?`;

    connection.query(query, [habitacionId], (error, results) => {
        if (error) {
            console.error('Error en la base de datos:', error);
            return res.status(500).json({ success: false, message: 'Error en la base de datos' });
        }

        if (results.length === 0) {
            return res.json({ success: true, resenas: [], message: 'No se encontraron reseñas.' });
        }

        res.json({ success: true, resenas: results });
    });
});

app.get('/api/usuario', (req, res) => {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ message: 'Usuario no autenticado' });
    }

    // Enviar el ID del usuario desde la sesión
    res.status(200).json({ id_usuario: req.session.userId });
});


app.get('/api/habitacion/:id', (req, res) => {
    const id_habitacion = req.params.id;

    connection.query('SELECT id_habitacion, nombre, descripcion, precio_por_noche AS precio FROM Habitacion WHERE id_habitacion = ?', [id_habitacion], (err, results) => {
        if (err) {
            console.error('Error al buscar habitación:', err);
            return res.status(500).json({ message: 'Error al obtener habitación' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Habitación no encontrada' });
        }

        // Retornar detalles de la habitación incluyendo id_habitacion
        return res.status(200).json({
            id_habitacion: results[0].id_habitacion,
            nombre: results[0].nombre,
            descripcion: results[0].descripcion,
            precio: results[0].precio // Este ahora corresponde a precio_por_noche
        });
    });
});
// Endpoint para obtener los detalles del usuario
app.get('/api/userDetails/:userId', (req, res) => {
    const userId = req.params.userId;

    connection.query('SELECT nombre, apellido, telefono, correo_electronico AS email FROM usuario WHERE id_usuario = ?', [userId], (err, results) => {
        if (err) {
            console.error('Error al obtener los detalles del usuario:', err);
            return res.status(500).json({ message: 'Error interno del servidor' });
        }

        // Verificar si se encontró el usuario
        if (results.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Enviar los detalles del usuario
        res.status(200).json({
            nombre: results[0].nombre,
            apellido: results[0].apellido,
            telefono: results[0].telefono,
            email: results[0].email
        });
    });
});

// Endpoint para actualizar los detalles del usuario
app.put('/api/userDetails/:userId', (req, res) => {
    const userId = req.params.userId;
    const { nombre, apellido, telefono, email } = req.body;

    // Verificar que todos los campos estén presentes
    if (!nombre || !apellido || !telefono || !email) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    // Consulta SQL para actualizar los detalles del usuario
    const updateQuery = `
        UPDATE usuario 
        SET nombre = ?, apellido = ?, telefono = ?, correo_electronico = ? 
        WHERE id_usuario = ?
    `;

    // Ejecutar la consulta con los datos proporcionados
    connection.query(updateQuery, [nombre, apellido, telefono, email, userId], (err, results) => {
        if (err) {
            console.error('Error al actualizar los detalles del usuario:', err);
            return res.status(500).json({ message: 'Error interno del servidor' });
        }

        // Verificar si se actualizó alguna fila
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Responder con éxito
        res.status(200).json({ message: 'Detalles del usuario actualizados correctamente' });
    });
});

// Endpoint para obtener las reservas de un usuario
app.get('/api/reservas/:userId', (req, res) => {
    const userId = req.params.userId;

    const query = `
        SELECT r.id_reserva, h.nombre AS habitacion, r.fecha_entrada AS fechaEntrada, r.fecha_salida AS fechaSalida, r.numero_personas AS numeroPersonas
        FROM reserva r
        JOIN habitacion h ON r.id_habitacion = h.id_habitacion
        WHERE r.id_usuario = ?
    `;

    connection.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error al obtener las reservas:', err);
            return res.status(500).json({ success: false, message: 'Error al obtener las reservas' });
        }

        if (results.length === 0) {
            return res.status(404).json({ success: false, message: 'No se encontraron reservas para este usuario' });
        }

        res.status(200).json({ success: true, reservas: results });
    });
});

// Endpoint para obtener los detalles de un administrador específico junto con su hotel
app.get('/api/get-admin/:adminId', (req, res) => {
    const adminId = req.params.adminId;

    const query = `
        SELECT U.nombre, U.apellido, U.telefono, U.correo_electronico,
               H.nombre_hotel, H.descripcion, H.direccion, H.categoria,
               H.numero_habitaciones, H.calificacion_promedio AS calificacion
        FROM Usuario U
        LEFT JOIN Hotel H ON H.id_usuario = U.id_usuario
        WHERE U.id_usuario = ? AND U.rol = 'administrador'
    `;

    connection.query(query, [adminId], (err, results) => {
        if (err) {
            console.error('Error al obtener los datos del administrador:', err);
            return res.status(500).json({ message: 'Error interno del servidor' });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Administrador no encontrado' });
        }

        res.status(200).json(results[0]);
    });
});

// Endpoint para actualizar los datos de un administrador y su hotel asignado
app.post('/api/edit-admin', (req, res) => {
    const { id_usuario, nombre, apellido, telefono, correo_electronico, nombre_hotel, descripcion, direccion, categoria, numero_habitaciones, calificacion } = req.body;

    // Actualizar datos del administrador
    const updateAdminQuery = `
        UPDATE Usuario
        SET nombre = ?, apellido = ?, telefono = ?, correo_electronico = ?
        WHERE id_usuario = ? AND rol = 'administrador'
    `;

    connection.query(updateAdminQuery, [nombre, apellido, telefono, correo_electronico, id_usuario], (err, adminResult) => {
        if (err) {
            console.error('Error al actualizar datos del administrador:', err);
            return res.status(500).json({ message: 'Error interno al actualizar el administrador' });
        }

        // Actualizar datos del hotel asignado
        const updateHotelQuery = `
            UPDATE Hotel
            SET nombre_hotel = ?, descripcion = ?, direccion = ?, categoria = ?, numero_habitaciones = ?, calificacion_promedio = ?
            WHERE id_usuario = ?
        `;

        connection.query(updateHotelQuery, [nombre_hotel, descripcion, direccion, categoria, numero_habitaciones, calificacion, id_usuario], (err, hotelResult) => {
            if (err) {
                console.error('Error al actualizar datos del hotel:', err);
                return res.status(500).json({ message: 'Error interno al actualizar el hotel' });
            }

            res.status(200).json({ message: 'Datos actualizados correctamente' });
        });
    });
});

// Endpoint para eliminar un administrador y todos los datos asociados
app.delete('/api/delete-admin/:adminId', (req, res) => {
    const adminId = req.params.adminId;

    // Consultas para eliminar en orden: habitaciones, hotel, y luego el administrador
    const deleteRoomsQuery = `
        DELETE FROM Habitacion
        WHERE id_hotel IN (SELECT id_hotel FROM Hotel WHERE id_usuario = ?)
    `;
    const deleteHotelQuery = `
        DELETE FROM Hotel
        WHERE id_usuario = ?
    `;
    const deleteAdminQuery = `
        DELETE FROM Usuario
        WHERE id_usuario = ? AND rol = 'administrador'
    `;

    // Eliminar habitaciones del hotel
    connection.query(deleteRoomsQuery, [adminId], (err, result) => {
        if (err) {
            console.error('Error al eliminar habitaciones:', err);
            return res.status(500).json({ message: 'Error al eliminar habitaciones' });
        }

        // Eliminar el hotel
        connection.query(deleteHotelQuery, [adminId], (err, result) => {
            if (err) {
                console.error('Error al eliminar el hotel:', err);
                return res.status(500).json({ message: 'Error al eliminar el hotel' });
            }

            // Finalmente, eliminar el administrador
            connection.query(deleteAdminQuery, [adminId], (err, result) => {
                if (err) {
                    console.error('Error al eliminar el administrador:', err);
                    return res.status(500).json({ message: 'Error al eliminar el administrador' });
                }

                res.status(200).json({ message: 'Administrador, hotel y habitaciones eliminados correctamente' });
            });
        });
    });
});

app.get('/api/admin-hotel', (req, res) => {
    const adminId = req.session.adminId; // Usar adminId de la sesión

    if (!adminId) {
        return res.status(403).json({ message: 'Administrador no autenticado' });
    }

    const query = `
        SELECT id_hotel
        FROM Hotel
        WHERE id_usuario = ?
    `;

    connection.query(query, [adminId], (err, results) => {
        if (err) {
            console.error('Error al obtener el id del hotel:', err);
            return res.status(500).json({ message: 'Error al obtener el hotel del administrador' });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'No se encontró un hotel para este administrador' });
        }

        res.status(200).json({ id_hotel: results[0].id_hotel });
    });
});

// Endpoint para obtener el nombre del usuario de la sesión
app.get('/api/username', (req, res) => {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ message: 'Usuario no autenticado' });
    }

    const userId = req.session.userId;
    const query = 'SELECT nombre FROM Usuario WHERE id_usuario = ?';

    connection.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error al obtener el nombre del usuario:', err);
            return res.status(500).json({ message: 'Error al obtener el nombre del usuario' });
        }

        if (results.length > 0) {
            const nombre = results[0].nombre;
            return res.status(200).json({ username: nombre });
        } else {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
    });
});


app.get('/api/habitacioness', (req, res) => {
    const adminId = req.session.adminId;

    if (!adminId) {
        return res.status(403).json({ message: 'Administrador no autenticado' });
    }

    const getHotelIdQuery = `
        SELECT id_hotel FROM Hotel WHERE id_usuario = ?
    `;

    connection.query(getHotelIdQuery, [adminId], (err, hotelResults) => {
        if (err || hotelResults.length === 0) {
            console.error('Error al obtener el id_hotel:', err);
            return res.status(500).json({ message: 'Error al obtener el id_hotel' });
        }

        const id_hotel = hotelResults[0].id_hotel;

        // Consulta para obtener solo las habitaciones del id_hotel
        const getRoomsQuery = `
            SELECT * FROM Habitacion WHERE id_hotel = ?
        `;

        connection.query(getRoomsQuery, [id_hotel], (err, roomResults) => {
            if (err) {
                console.error('Error al obtener las habitaciones:', err);
                return res.status(500).json({ message: 'Error al obtener las habitaciones' });
            }

            res.status(200).json({ habitaciones: roomResults });
        });
    });
});

// Endpoint para obtener los detalles de una habitación específica
app.get('/api/habitaciones/:id', (req, res) => {
    const habitacionId = req.params.id;

    const query = 'SELECT * FROM Habitacion WHERE id_habitacion = ?';
    connection.query(query, [habitacionId], (err, results) => {
        if (err) {
            console.error('Error al obtener los detalles de la habitación:', err);
            return res.status(500).json({ message: 'Error al obtener los detalles de la habitación' });
        }

        if (results.length > 0) {
            res.status(200).json(results[0]);
        } else {
            res.status(404).json({ message: 'Habitación no encontrada' });
        }
    });
});




app.listen(port, () => {
    console.log(`Servidor ejecutándose en http://localhost:${port}`);
});