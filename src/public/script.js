// Precios de las habitaciones 
const precioEstándar = 100;
const precioDeluxe = 200;
const precioViajero = 150;

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

// Función para mostrar el modal de reserva
function openReservaModal(precio, imagen, tipo, userId) {
    if (!usuarioLogueado) {
        alert("Debes iniciar sesión para hacer una reserva.");
        openLoginModal();
        return;
    }

    const modal = document.getElementById("reservaModal");
    const habitacionImagen = document.querySelector("#reservaModal .habitacion-imagen");

    document.getElementById("precioPorNoche").value = precio;
    document.getElementById("tipoHabitacion").value = tipo;
    habitacionImagen.src = imagen;

    // Asignar el userID al campo oculto
    document.getElementById("idClienteInput").value = userId;

    // Calcular los servicios disponibles según el tipo de habitación
    const servicios = obtenerServicios(tipo);
    mostrarServicios(servicios);

    calcularPrecioTotal();

    modal.style.display = "block";
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

    fetch('/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ correo_electronico: email, contrasena: password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'Inicio de sesión exitoso') {
            usuarioLogueado = true;
            userID = data.userId;
            userName = data.nombre;
            userLastName = data.apellido;
            
            closeLoginModal();
            updateUIOnLogin();
        } else {
            alert('Error al iniciar sesión: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error al iniciar sesión. Verifica tus credenciales e intenta de nuevo.');
    });
}

document.getElementById("loginForm").addEventListener("submit", loginUser);

function updateUIOnLogin() {
    const loginNavItem = document.getElementById("loginNavItem");
    const profileNavItem = document.getElementById("profileNavItem");
    const logoutNavItem = document.getElementById("logoutNavItem");

    if (usuarioLogueado) {
        loginNavItem.style.display = "none";
        profileNavItem.style.display = "block";
        logoutNavItem.style.display = "block";

        // Obtener y mostrar los datos del perfil del usuario
        fetch('/api/profile')
            .then(response => response.json())
            .then(data => {
                const userNameElement = document.getElementById("userName");
                const perfilNombre = document.getElementById("perfilNombre");
                const perfilApellido = document.getElementById("perfilApellido");
                const perfilEmail = document.getElementById("perfilEmail");

                if (userNameElement) {
                    userNameElement.textContent = data.nombre;
                }
                if (perfilNombre) {
                    perfilNombre.textContent = data.nombre;
                }
                if (perfilApellido) {
                    perfilApellido.textContent = data.apellido;
                }
                if (perfilEmail) {
                    perfilEmail.textContent = data.correo_electronico;
                }
            })
            .catch(error => {
                console.error('Error al obtener perfil:', error);
            });
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

// Función para obtener el tipo de habitación de una reserva
function obtenerTipoHabitacion(reservaId) {
    return fetch(`/api/habitacion/${reservaId}`)
        .then(response => response.json())
        .then(data => {
            return data.tipoHabitacion;
        })
        .catch(error => {
            console.error('Error al obtener tipo de habitación:', error);
            return null;
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

    fetch('/api/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nombre: name, apellido: lastName, correo_electronico: email, contrasena: password })
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
