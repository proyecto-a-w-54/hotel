
// Variable para gestionar el estado de sesión del usuario
let usuarioLogueado = false;
let userID = null;

// Función para calcular el precio total de la reserva
function calcularPrecioTotal() {
    const fechaEntradaInput = document.getElementById("fechaEntrada");
    const fechaSalidaInput = document.getElementById("fechaSalida");
    const fechaEntrada = new Date(fechaEntradaInput.value);
    const fechaSalida = new Date(fechaSalidaInput.value);
    const fechaActual = new Date(); // Fecha actual

    // Validar que la fecha de entrada no sea anterior a la fecha actual
    if (fechaEntrada < fechaActual) {
        alert("La fecha de entrada no puede ser anterior a la fecha actual.");
        fechaEntradaInput.value = ''; // Limpiar el campo de entrada de fecha
        return;
    }

    // Validar que la fecha de salida no sea anterior a la fecha actual
    if (fechaSalida < fechaActual) {
        alert("La fecha de salida no puede ser anterior a la fecha actual.");
        fechaSalidaInput.value = ''; // Limpiar el campo de salida de fecha
        return;
    }

    // Validar que la fecha de salida no sea igual o anterior a la fecha de entrada
    if (fechaSalida <= fechaEntrada) {
        alert("La fecha de salida debe ser posterior a la fecha de entrada.");
        fechaSalidaInput.value = ''; // Limpiar el campo de salida de fecha
        return;
    }

    // Continuar con el cálculo del precio total si las fechas son válidas
    const numeroNoches = (fechaSalida - fechaEntrada) / (1000 * 3600 * 24);
    let precioPorNoche = parseFloat(document.getElementById("precioPorNoche").value);
    const numPersonas = parseInt(document.getElementById("numPersonas").value);

    if (numPersonas > 4) {
        alert("Por favor, reserve una habitación adicional para alojar a más de 4 personas.");
        return;
    } else if (numPersonas > 1) {
        precioPorNoche *= (1 + (numPersonas - 1) * 0.1); // Aumentar un 10% por cada persona adicional
    }

    const total = precioPorNoche * numeroNoches;
    document.getElementById("precioTotal").textContent = "Total: " + total.toFixed(2);
}

function openProfileModal() {
    const modal = document.getElementById("perfilModal");
    modal.style.display = "block";

    // Hacer una solicitud al servidor para obtener la información del usuario
    fetch('/api/user')
        .then(response => response.json())
        .then(data => {
            if (data.user) {
                // Llenar los campos del perfil con la información del usuario
                document.getElementById("perfilNombre").textContent = data.user.nombre;
                document.getElementById("perfilApellido").textContent = data.user.apellido;
                document.getElementById("perfilEmail").textContent = data.user.correo_electronico;
                // Llamar a la función para mostrar las reservas en el modal
                renderReservas(data.reservas);
            } else {
                console.error('No se pudo obtener la información del usuario.');
            }
        })
        .catch(error => {
            console.error('Error al obtener la información del usuario:', error);
        });
}

// Función para obtener los servicios disponibles según el tipo de habitación
function obtenerServicios(tipo) {
    let servicios = [];
    if (tipo === 'Estándar') {
        servicios = ['Acceso al gimnasio', 'Acceso a la piscina'];
    } else if (tipo === 'Deluxe') {
        servicios = ['Acceso al gimnasio', 'Acceso a la piscina', 'Acceso al spa'];
    } else if (tipo === 'Viajero') {
        servicios = ['Acceso a la piscina'];
    }
    return servicios;
}

// Función para mostrar los servicios en la lista
function mostrarServicios(servicios) {
    const listaServicios = document.getElementById("tipoServicio");
    listaServicios.innerHTML = ''; // Limpiar la lista antes de agregar los nuevos servicios
    servicios.forEach(function (servicio) {
        const listItem = document.createElement("li");
        listItem.textContent = servicio;
        listaServicios.appendChild(listItem);
    });
}

// Función para ocultar el modal de reserva
function closeReservaModal() {
    const modal = document.getElementById("reservaModal");
    modal.style.display = "none";
}

// Función para confirmar la reserva
function confirmarReserva(event) {
    event.preventDefault();

    if (!usuarioLogueado) {
        alert("Debes iniciar sesión para hacer una reserva.");
        openLoginModal();
        return;
    }

    const fechaInicio = document.getElementById("fechaEntrada").value;
    const fechaFin = document.getElementById("fechaSalida").value;
    const numPersonas = document.getElementById("numPersonas").value;
    const tipoHabitacion = document.getElementById("tipoHabitacion").value;
    const userID = document.getElementById("idClienteInput").value; // No asignes el valor, solo obténlo

    const reservaData = {
        fecha_entrada: fechaInicio,
        fecha_salida: fechaFin,
        numero_personas: numPersonas,
        id_habitacion: tipoHabitacion, // Este campo puede necesitar ajuste
        id_usuario: userID
    };

    fetch('/api/reserve', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(reservaData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'Reserva registrada con éxito') {
            alert('¡Reserva registrada con éxito!');
            closeReservaModal();
        } else {
            alert('Error al registrar reserva: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

// Añadir evento al formulario de reserva
document.getElementById("reservaForm").addEventListener("submit", confirmarReserva);

function openLoginModal() {
    const modal = document.getElementById("loginModal");
    modal.style.display = "block";
}

function closeLoginModal() {
    const modal = document.getElementById("loginModal");
    modal.style.display = "none";
}

function loginUser(event) {
    event.preventDefault();

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    // Verificar si los campos están completos
    if (!email || !password) {
        alert('Por favor, ingresa el correo electrónico y la contraseña.');
        return;
    }

    fetch('/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ correo_electronico: email, contrasena: password })
    })
    .then(response => {
        // Verificar si la respuesta es exitosa
        if (!response.ok) {
            throw new Error('Error al iniciar sesión: ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        if (data.message === 'Inicio de sesión exitoso') {
            // Guardar el userId en localStorage
            localStorage.setItem('userId', data.userId);

            // Redirigir a la página adecuada
            if (data.redirect) {
                window.location.href = data.redirect;
            } else {
                closeLoginModal();
                updateUIOnLogin();
            }
        } else {
            alert('Error al iniciar sesión: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error al iniciar sesión. Por favor, intenta de nuevo.');
    });
}


document.getElementById("loginForm").addEventListener("submit", loginUser);

window.onload = () => {
    // Verificar si el userId ya está guardado en localStorage
    const storedUserId = localStorage.getItem('userId');
    
    if (storedUserId) {
        // Si hay un ID de usuario almacenado, verificar la sesión en el servidor
        checkSession();
    } else {
        // Si no hay ningún ID almacenado, asegúrate de que la sesión no esté activa
        usuarioLogueado = false;
        updateUIOnLogin(); // Asegurarte de que la interfaz se actualiza como si no hubiera sesión
    }

    // Verificar la sesión cada 5 minutos
    setInterval(checkSession, 300000);
};

function checkSession() {
    fetch('/api/check-session')
        .then(response => response.json())
        .then(data => {
            if (data.loggedIn) {
                // Si la sesión está activa, asegurarse de que los datos se actualizan correctamente
                console.log('Sesión activa. Usuario ID:', data.userId);
                usuarioLogueado = true; 
                userID = data.userId;
                localStorage.setItem('userId', data.userId); // Asegurarte de que el ID se almacena
                updateUIOnLogin();
            } else {
                // Si no hay sesión activa, asegurarse de que el estado se restablece
                console.log('No hay sesión activa. Redirigiendo al login.');
                usuarioLogueado = false;
                userID = null;
                localStorage.removeItem('userId'); // Eliminar el ID almacenado
                updateUIOnLogin();
            }
        })
        .catch(error => {
            console.error('Error al verificar la sesión:', error);
        });
}

function updateUIOnLogin() {
    const loginNavItem = document.getElementById("loginNavItem");
    const profileNavItem = document.getElementById("profileNavItem");
    const logoutNavItem = document.getElementById("logoutNavItem");

    if (usuarioLogueado) {
        loginNavItem.style.display = "none";
        profileNavItem.style.display = "block";
        logoutNavItem.style.display = "block";
    } else {
        loginNavItem.style.display = "block";
        profileNavItem.style.display = "none";
        logoutNavItem.style.display = "none";
    }
}

function logoutUser() {
    fetch('/api/logout', {
        method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'Sesión cerrada exitosamente') {
            usuarioLogueado = false;
            userID = null;
            alert('Sesión cerrada exitosamente');
            updateUIOnLogin();
            location.reload();
        } else {
            alert('Error al cerrar sesión: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function openProfileModal() {
    const modal = document.getElementById("perfilModal");
    modal.style.display = "block";

    // Hacer una solicitud al servidor para obtener las reservas del usuario
    fetch('/api/reservas')
        .then(response => response.json())
        .then(data => {
            // Llamar a una función para mostrar las reservas en el modal
            renderReservas(data);
        })
        .catch(error => {
            console.error('Error al obtener las reservas:', error);
        });
}

// Función para renderizar las reservas en la tabla
async function renderReservas(reservas) {
    const reservasBody = document.getElementById("reservasBody");
    reservasBody.innerHTML = ''; // Limpiar el cuerpo de la tabla

    for (const reserva of reservas) {
        // Formatear las fechas
        const fechaInicio = new Date(reserva.fecha_inicio).toLocaleDateString();
        const fechaFin = new Date(reserva.fecha_fin).toLocaleDateString();

        // Obtener el tipo de habitación
        const tipoHabitacion = await obtenerTipoHabitacion(reserva.id_reserva);

        // Crear la fila de la tabla
        const row = document.createElement("tr");
        row.innerHTML = `<td>${fechaInicio}</td>
                         <td>${fechaFin}</td>
                         <td>${tipoHabitacion}</td>`;
        reservasBody.appendChild(row);
    }
}

function obtenerTipoHabitacion(reservaId) {
    return fetch(`/api/habitacion/${reservaId}`)
        .then(response => response.json())
        .then(data => {
            return data.tipoHabitacion;
        })
        .catch(error => {
            console.error('Error al obtener tipo de habitación:', error);
            return 'Desconocido'; // Retornar un valor por defecto en caso de error
        });
}

function closeProfileModal() {
    const modal = document.getElementById("perfilModal");
    modal.style.display = "none";
}

function openRegisterModal() {
    const modal = document.getElementById("registerModal");
    modal.style.display = "block";
}

function closeRegisterModal() {
    const modal = document.getElementById("registerModal");
    modal.style.display = "none";
}

function registerUser(event) {
    event.preventDefault();

    const name = document.getElementById("registerName").value;
    const lastName = document.getElementById("registerLastName").value;
    const email = document.getElementById("registerEmail").value;
    const password = document.getElementById("registerPassword").value;
    const phone = document.getElementById("registerPhone").value; 

    console.log("Datos del formulario:", { name, lastName, email, phone, password });

    fetch('/api/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nombre: name, apellido: lastName, correo_electronico: email, telefono: phone , contrasena: password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'Usuario registrado con éxito') {
            alert('Registro exitoso. Ahora puedes iniciar sesión.');
            closeRegisterModal();
            openLoginModal();
        } else {
            alert('Error: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error al registrar usuario. Verifica los datos e intenta de nuevo.');
    });
}

document.getElementById("registerForm").addEventListener("submit", registerUser);

// Función para mostrar/ocultar el sidebar
function toggleSidebar() {
            const sidebar = document.getElementById('sidebar');
            sidebar.classList.toggle('open');
        }

// Función para cerrar el sidebar al hacer clic fuera de él
document.addEventListener('click', function(event) {
    const sidebar = document.getElementById('sidebar');
    const toggleButton = event.target.closest('a[onclick="toggleSidebar()"]'); // Detectar si hizo clic en el botón de tres rayas

        if (!sidebar.contains(event.target) && !toggleButton && sidebar.classList.contains('open')) {
                sidebar.classList.remove('open'); // Cerrar el sidebar si el clic es fuera
        }
});


document.addEventListener('DOMContentLoaded', function () {
    // Llamar a la función para cargar habitaciones al iniciar
    fetchHabitaciones();
});

function fetchHabitaciones() {
    fetch('/api/habitaciones') // Asegúrate de que este endpoint sea el correcto
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                renderHabitaciones(data.habitaciones);
            } else {
                console.error('Error al obtener habitaciones:', data.message);
            }
        })
        .catch(error => console.error('Error:', error));
}

function goToHabitacionPage(habitacionId) {
    window.location.href = `/pagHabitaciones/habitacion.html?id=${habitacionId}`; // Cambia esto a la URL correcta
}

function renderHabitaciones(habitaciones) {
    const roomListContainer = document.getElementById('roomListContainerHabitaciones');
    roomListContainer.innerHTML = ''; // Limpiar el contenedor

    const randomRooms = habitaciones.sort(() => 0.5 - Math.random()).slice(0, 7); // Selección aleatoria

    randomRooms.forEach(habitacion => {
        const imageUrl = habitacion.imagen_url ? `http://localhost:3000/uploads/${habitacion.imagen_url}` : '../imagenes/habitacion1.jpeg';
        const div = document.createElement('div');
        div.className = 'card-item'; // Clase para el estilo de carta
        div.onclick = () => goToHabitacionPage(habitacion.id_habitacion); // Hacer la tarjeta clickeable
        div.innerHTML = `
            <img src="${imageUrl}" alt="${habitacion.tipo_habitacion}" class="card-image">
            <div class="card-body">
                <h5>${habitacion.nombre || 'Nombre no disponible'}</h5>
                <p>Tipo: ${habitacion.tipo_habitacion}</p>
                <p>Precio por noche: ${habitacion.precio_por_noche}</p>
                <p>Estado: ${habitacion.estado_disponibilidad}</p>
            </div>
        `;
        roomListContainer.appendChild(div);
    });
}


document.addEventListener('DOMContentLoaded', function () {
    // Llamar a la función para cargar hoteles al iniciar
    fetchHoteles();
});

function fetchHoteles() {
    fetch('/api/hoteles') // Endpoint actualizado para obtener los hoteles
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                renderHoteles(data.hoteles);
            } else {
                console.error('Error al obtener hoteles:', data.message);
            }
        })
        .catch(error => console.error('Error:', error));
}

// Función para redirigir a la página de detalles del hotel
function goToHotelPage(id_hotel) {
    window.location.href = `/hotel/hotel.html?id=${id_hotel}`; // Cambia esto a la URL correcta
}

function renderHoteles(hoteles) {
    const roomListContainer = document.getElementById('roomListContainerHoteles'); // ID actualizado
    roomListContainer.innerHTML = ''; // Limpiar el contenedor

    // Seleccionar hoteles aleatorios
    const randomHotels = hoteles.sort(() => 0.5 - Math.random()).slice(0, 7);

    randomHotels.forEach(hotel => {
        const imageUrl = hotel.imagen_url ? `http://localhost:3000/uploads/${hotel.imagen_url}` : '../imagenes/habitacion1.jpeg'; // Imagen por defecto si no hay foto
        const div = document.createElement('div');
        div.className = 'card-item'; // Usar la clase general para las cartas
        div.onclick = () => goToHotelPage(hotel.id_hotel); // Hacer la tarjeta clickeable
        div.innerHTML = `
            <img src="${imageUrl}" alt="${hotel.nombre_hotel}" class="card-image">
            <div class="card-body">
                <h5>${hotel.nombre_hotel || 'Nombre no disponible'}</h5>
                <p>Dirección: ${hotel.direccion || 'No disponible'}</p>
                <p>Categoría: ${hotel.categoria || 'No disponible'}</p>
                <p>Calificación: ${hotel.calificacion_promedio || 'No disponible'}</p>
                <p>Número de Habitaciones: ${hotel.numero_habitaciones || 'No disponible'}</p>
            </div>
        `;
        roomListContainer.appendChild(div);
    });
}
