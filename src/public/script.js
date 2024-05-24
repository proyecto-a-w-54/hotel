// Precios de las habitaciones 
var precioEstándar = 100;
var precioDeluxe = 200;
var precioViajero = 150;

// Variable para gestionar el estado de sesión del usuario
var usuarioLogueado = false;
var userID = null; // Añadimos esta variable para almacenar el userID

// Función para calcular el precio total
function calcularPrecioTotal() {
    var fechaEntrada = new Date(document.getElementById("fechaEntrada").value);
    var fechaSalida = new Date(document.getElementById("fechaSalida").value);
    var numeroNoches = (fechaSalida - fechaEntrada) / (1000 * 3600 * 24);
    var precioPorNoche = parseFloat(document.getElementById("precioPorNoche").value);
    var numPersonas = parseInt(document.getElementById("numPersonas").value);
    
    if (numPersonas > 4) {
        alert("Por favor, reserve una habitación adicional para alojar a más de 4 personas.");
        return;
    } else if (numPersonas > 1) {
        precioPorNoche *= (1 + (numPersonas - 1) * 0.1); // Aumentar un 10% por cada persona adicional
    }

    var total = precioPorNoche * numeroNoches;

    document.getElementById("precioTotal").textContent = "Total: " + total.toFixed(3);
}

// Función para mostrar el modal de reserva
function openReservaModal(precio, imagen, tipo, userId) {
    if (!usuarioLogueado) {
        alert("Debes iniciar sesión para hacer una reserva.");
        openLoginModal();
        return;
    }

    var modal = document.getElementById("reservaModal");
    var habitacionImagen = document.querySelector("#reservaModal .habitacion-imagen");

    document.getElementById("precioPorNoche").value = precio;
    document.getElementById("tipoHabitacion").value = tipo;
    habitacionImagen.src = imagen;

    // Asignar el userID al campo oculto
    document.getElementById("idClienteInput").value = userId;

    // Calcular los servicios disponibles según el tipo de habitación
    var servicios = obtenerServicios(tipo);
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
    var listaServicios = document.getElementById("tipoServicio");
    listaServicios.innerHTML = ''; // Limpiar la lista antes de agregar los nuevos servicios
    servicios.forEach(function (servicio) {
        var listItem = document.createElement("li");
        listItem.textContent = servicio;
        listaServicios.appendChild(listItem);
    });
}


// Función para ocultar el modal de reserva
function closeReservaModal() {
    var modal = document.getElementById("reservaModal");
    modal.style.display = "none";
}

// Función para confirmar la reserva
function confirmarReserva() {
    event.preventDefault();

    if (!usuarioLogueado) {
        alert("Debes iniciar sesión para hacer una reserva.");
        openLoginModal();
        return;
    }

    var fechaInicio = document.getElementById("fechaEntrada").value;
    var fechaFin = document.getElementById("fechaSalida").value;
    var numPersonas = document.getElementById("numPersonas").value;
    var tipoHabitacion = document.getElementById("tipoHabitacion").value;
    var userID = document.getElementById("idClienteInput").value; // No asignes el valor, solo obténlo

    var reservaData = {
        fechaInicio: fechaInicio,
        fechaFin: fechaFin,
        numPersonas: numPersonas,
        tipoHabitacion: tipoHabitacion,
        userID: userID
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
    var modal = document.getElementById("loginModal");
    modal.style.display = "block";
}

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
    var logoutNavItem = document.getElementById("logoutNavItem");

    if (usuarioLogueado) {
        loginNavItem.style.display = "none";
        profileNavItem.style.display = "block";
        logoutNavItem.style.display = "block";
    } else {
        loginNavItem.style.display = "block";
        profileNavItem.style.display = "none";
        logoutNavItem.style.display = "none";
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
    var modal = document.getElementById("perfilModal");
    modal.style.display = "block";
}

function closeProfileModal() {
    var modal = document.getElementById("perfilModal");
    modal.style.display = "none";
}

function openRegisterModal() {
    var modal = document.getElementById("registerModal");
    modal.style.display = "block";
}

function closeRegisterModal() {
    var modal = document.getElementById("registerModal");
    modal.style.display = "none";
}

function registerUser(event) {
    event.preventDefault();

    var name = document.getElementById("registerName").value;
    var lastName = document.getElementById("registerLastName").value;
    var email = document.getElementById("registerEmail").value;
    var password = document.getElementById("registerPassword").value;

    fetch('/api/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: name, lastName: lastName, email: email, password: password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'Registro exitoso') {
            alert('Registro exitoso. Ahora puedes iniciar sesión.');
            closeRegisterModal();
            openLoginModal();
        } else {
            alert('Error al registrarse: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

document.getElementById("registerForm").addEventListener("submit", registerUser);

updateUIOnLogin();
