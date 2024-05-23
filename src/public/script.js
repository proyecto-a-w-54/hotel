// Precios de las habitaciones (podrías obtenerlos dinámicamente desde una base de datos)
var precioEstándar = 100;
var precioDeluxe = 200;
var precioViajero = 150;

// Variable para gestionar el estado de sesión del usuario
var usuarioLogueado = false; // Esto debería ser actualizado dinámicamente en tu aplicación real

// Función para calcular el precio total
function calcularPrecioTotal() {
    var fechaEntrada = new Date(document.getElementById("fechaEntrada").value);
    var fechaSalida = new Date(document.getElementById("fechaSalida").value);
    var numeroNoches = (fechaSalida - fechaEntrada) / (1000 * 3600 * 24);
    var precioPorNoche = parseFloat(document.getElementById("precioPorNoche").value);
    var numPersonas = parseInt(document.getElementById("numPersonas").value);
    
    // Ajustar el precio por persona según el número de personas
    if (numPersonas > 4) {
        alert("Por favor, reserve una habitación adicional para alojar a más de 4 personas.");
        return;
    } else if (numPersonas > 1) {
        precioPorNoche *= (1 + (numPersonas - 1) * 0.1); // Aumentar un 10% por cada persona adicional
    }

    var total = precioPorNoche * numeroNoches;

    // Mostrar el precio total en el modal de reserva
    document.getElementById("precioTotal").textContent = "Total: " + total.toFixed(2);
}

// Función para mostrar el modal de reserva
function openReservaModal(precio, imagen, tipo) {
    if (!usuarioLogueado) {
        alert("Debes iniciar sesión para hacer una reserva.");
        openLoginModal();
        return;
    }
    
    var modal = document.getElementById("reservaModal");
    var habitacionImagen = document.querySelector("#reservaModal .habitacion-imagen");
    
    

    // Asignar el precio y la imagen correspondiente
    document.getElementById("precioPorNoche").value = precio;
    document.getElementById("tipoHabitacion").value = tipo;
    habitacionImagen.src = imagen;

    // Calcular el precio total inicial
    calcularPrecioTotal();

    // Mostrar el modal
    modal.style.display = "block";
}

// Función para ocultar el modal de reserva
function closeReservaModal() {
    var modal = document.getElementById("reservaModal");
    modal.style.display = "none";
}

// Función para confirmar la reserva
function confirmarReserva(event) {
    event.preventDefault(); // Prevenir el comportamiento predeterminado del formulario

    // Verificar si el usuario está autenticado
    if (!usuarioLogueado) {
        alert("Debes iniciar sesión para hacer una reserva.");
        openLoginModal(); // Mostrar el modal de inicio de sesión si el usuario no está autenticado
        return;
    }

    // Obtener los datos del formulario de reserva
    var fechaInicio = document.getElementById("fechaEntrada").value;
    var fechaFin = document.getElementById("fechaSalida").value;
    var numPersonas = document.getElementById("numPersonas").value;
    var tipoHabitacion = document.getElementById("tipoHabitacion").value;

    // Crear objeto con los datos de reserva
    var reservaData = {
        fechaInicio: fechaInicio,
        fechaFin: fechaFin,
        numPersonas: numPersonas,
        tipoHabitacion: tipoHabitacion // Agregar el tipo de habitación al objeto
    };

    // Enviar los datos de reserva al servidor
    fetch('/api/reserve', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
            // Aquí puedes incluir cualquier encabezado de autenticación necesario
        },
        body: JSON.stringify(reservaData)
    })
    .then(response => response.json())
    .then(data => {
        // Manejar la respuesta del servidor
        if (data.message === 'Reserva registrada con éxito') {
            alert('¡Reserva registrada con éxito!');
            closeReservaModal(); // Cerrar el modal de reserva si la reserva se registró correctamente
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

// Función para abrir el modal de inicio de sesión
function openLoginModal() {
    var modal = document.getElementById("loginModal");
    modal.style.display = "block";
}

// Función para cerrar el modal de inicio de sesión
function closeLoginModal() {
    var modal = document.getElementById("loginModal");
    modal.style.display = "none";
}

function loginUser(event) {
    event.preventDefault();

    var email = document.getElementById("loginEmail").value;
    var password = document.getElementById("loginPassword").value;

    fetch('/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email, password: password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'Inicio de sesión exitoso') {
            usuarioLogueado = true;
            userID = data.userId;
            userName = data.userName;
            userLastName = data.userLastName;
            userEmail = email;
            
            closeLoginModal();
            updateUIOnLogin();
        } else {
            alert('Error al iniciar sesión: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function updateUIOnLogin() {
    var loginNavItem = document.getElementById("loginNavItem");
    var profileNavItem = document.getElementById("profileNavItem");

    if (usuarioLogueado) {
        loginNavItem.style.display = "none";
        profileNavItem.style.display = "block";
    } else {
        loginNavItem.style.display = "block";
        profileNavItem.style.display = "none";
    }

    var userNameElement = document.getElementById("userName");
    if (userNameElement) {
        userNameElement.textContent = userName;
    }

    var perfilNombre = document.getElementById("perfilNombre");
    var perfilApellido = document.getElementById("perfilApellido");
    var perfilEmail = document.getElementById("perfilEmail");
    if (perfilNombre) {
        perfilNombre.textContent = userName;
    }
    if (perfilApellido) {
        perfilApellido.textContent = userLastName;
    }
    if (perfilEmail) {
        perfilEmail.textContent = userEmail;
    }
}

// Función para cerrar sesión
function logoutUser() {
    fetch('/api/logout', {
        method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'Sesión cerrada exitosamente') {
            usuarioLogueado = false;
            alert('Sesión cerrada exitosamente');
            updateUIOnLogin(); // Actualizar la interfaz de usuario
            location.reload(); // Recargar la página para actualizar el estado de sesión
        } else {
            alert('Error al cerrar sesión: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

// Mostrar modal de perfil
function openProfileModal() {
    if (!usuarioLogueado) {
        alert("Debes iniciar sesión para ver tu perfil.");
        openLoginModal();
        return;
    }

    var modal = document.getElementById("perfilModal");
    modal.style.display = "block";
}

// Función para cerrar el modal de perfil
function closeProfileModal() {
    var modal = document.getElementById("perfilModal");
    modal.style.display = "none";
}

// Mostrar modal de registro
function openRegisterModal() {
    var modal = document.getElementById("registerModal");
    modal.style.display = "block";
}

// Cerrar modal de registro
function closeRegisterModal() {
    var modal = document.getElementById("registerModal");
    modal.style.display = "none";
}

// Función para registrar usuario
function registerUser(event) {
    event.preventDefault(); // Prevenir el comportamiento predeterminado del formulario

    var name = document.getElementById("registerName").value;
    var lastName = document.getElementById("registerLastName").value;
    var email = document.getElementById("registerEmail").value;
    var password = document.getElementById("registerPassword").value;

    // Enviar los datos de registro al servidor
    fetch('/api/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: name, lastName: lastName, email: email, password: password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'Cliente registrado con éxito') {
            alert('Registro exitoso. Ahora puedes iniciar sesión.');
            closeRegisterModal();
        } else {
            alert('Error al registrar: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

// Añadir eventos a los formularios
document.getElementById("loginForm").addEventListener("submit", loginUser);
document.getElementById("registerForm").addEventListener("submit", registerUser);

function openEditarPerfilModal() {
    var modal = document.getElementById("editarPerfilModal");
    modal.style.display = "block";
    console.log("Modal de edición de perfil abierto");
}

// Función para cerrar el modal de edición de perfil
function closeEditarPerfilModal() {
    var modal = document.getElementById("editarPerfilModal");
    modal.style.display = "none";
    console.log("Modal de edición de perfil cerrado");
}

// Inicializar el estado de la UI basado en el estado de sesión
updateUIOnLogin();
