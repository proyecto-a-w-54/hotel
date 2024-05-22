// Obtener el precio por noche de la habitación (aquí podrías obtenerlo dinámicamente desde una base de datos)
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
function openReservaModal(precio, imagen) {
    if (!usuarioLogueado) {
        alert("Debes iniciar sesión para hacer una reserva.");
        openLoginModal();
        return;
    }
    
    var modal = document.getElementById("reservaModal");
    var habitacionImagen = document.querySelector("#reservaModal .habitacion-imagen");

    // Asignar el precio y la imagen correspondiente
    document.getElementById("precioPorNoche").value = precio;
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
function confirmarReserva() {
    // Aquí podrías enviar los datos de la reserva al servidor o realizar otras operaciones necesarias
    // Por ahora, solo cerramos el modal
    closeReservaModal();
}

// Función para mostrar el modal de inicio de sesión
function openLoginModal() {
    var modal = document.getElementById("loginModal");
    modal.style.display = "block";
    console.log("Modal de inicio de sesión abierto");
}
// Función para ocultar el modal de inicio de sesión
function closeLoginModal() {
    var modal = document.getElementById("loginModal");
    modal.style.display = "none";
    console.log("Modal de inicio de sesión cerrado");
}

// Función para mostrar el modal de registro
function openRegisterModal() {
    var modal = document.getElementById("registerModal");
    modal.style.display = "block";
    console.log("Modal de registro abierto");
}
// Función para ocultar el modal de registro
function closeRegisterModal() {
    var modal = document.getElementById("registerModal");
    modal.style.display = "none";
    console.log("Modal de registro cerrado");
}

// Función para mostrar el modal de perfil
function openProfileModal() {
    var modal = document.getElementById("perfilModal");
    modal.style.display = "block";
    console.log("Modal de perfil abierto");
}
// Función para ocultar el modal de perfil
function closeProfileModal() {
    var modal = document.getElementById("perfilModal");
    modal.style.display = "none";
    console.log("Modal de perfil cerrado");
}

// Función para abrir el modal de edición de perfil
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

// Función para guardar los cambios en el perfil
function guardarCambiosPerfil() {
    // Aquí podrías enviar los datos actualizados al servidor
    // Por ahora, solo cerramos el modal de edición de perfil
    closeEditarPerfilModal();
}
// Obtener el formulario por su ID
const registerForm = document.getElementById('registerForm');
const loginForm = document.getElementById('loginForm');

// Agregar un evento de escucha para el evento submit del formulario de registro
registerForm.addEventListener('submit', registerUser);

// Definir la función para manejar el envío del formulario de registro
function registerUser(event) {
    event.preventDefault(); // Evitar el comportamiento predeterminado del formulario
    // Obtener los datos del formulario
    const formData = new FormData(registerForm);
    // Convertir los datos a un objeto
    const data = {};
    formData.forEach((value, key) => {
        data[key] = value;
    });

    // Realizar la solicitud fetch con los datos del formulario de registro
    fetch('/api/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error al registrar usuario');
        }
        return response.json();
    })
    .then(result => {
        console.log(result);
        // Mostrar un mensaje de éxito al usuario
        alert('¡Registro exitoso!');
        // Cerrar el modal de registro
        closeRegisterModal();
    })
    .catch(error => {
        console.error('Error:', error);
        // Mostrar un mensaje de error al usuario
        alert('Error al registrar usuario. Por favor, inténtalo de nuevo.');
    });
}

// Agregar un evento de escucha para el evento submit del formulario de inicio de sesión
loginForm.addEventListener('submit', loginUser);

// Definir la función para manejar el envío del formulario de inicio de sesión
function loginUser(event) {
    event.preventDefault(); // Evitar el comportamiento predeterminado del formulario
    // Obtener los datos del formulario de inicio de sesión
    const formData = new FormData(loginForm);
    // Convertir los datos a un objeto
    const data = {};
    formData.forEach((value, key) => {
        data[key] = value;
    });

    // Realizar la solicitud fetch con los datos del formulario de inicio de sesión
    fetch('/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error al iniciar sesión');
        }
        return response.json();
    })
    .then(result => {
        console.log(result);
        // Almacenar el estado de inicio de sesión en el cliente
        usuarioLogueado = true;
        // Mostrar un mensaje de éxito al usuario
        alert('¡Inicio de sesión exitoso!');
        // Cerrar el modal de inicio de sesión
        closeLoginModal();
    })
    .catch(error => {
        console.error('Error:', error);
        // Mostrar un mensaje de error al usuario
        alert('Error al iniciar sesión. Por favor, verifica tus credenciales e inténtalo de nuevo.');
    });
}

// Función para manejar el cierre de sesión
function logoutUser() {
    // Realizar la solicitud fetch al servidor para cerrar sesión
    fetch('/api/logout')
    .then(response => {
        if (!response.ok) {
            throw new Error('Error al cerrar sesión');
        }
        return response.json();
    })
    .then(result => {
        // Actualizar el estado de inicio de sesión en el cliente
        usuarioLogueado = false;
        console.log('Sesión cerrada exitosamente:', result);
        // Mostrar un mensaje de éxito al usuario o redirigirlo a otra página
        alert('¡Sesión cerrada exitosamente!');
    })
    .catch(error => {
        console.error('Error al cerrar sesión:', error);
        // Mostrar un mensaje de error al usuario
        alert('Error al cerrar sesión. Por favor, inténtalo de nuevo.');
    });
}
// Función para mostrar el modal de perfil
function openProfileModal() {
    var modal = document.getElementById("perfilModal");
    modal.style.display = "block";
    // Mostrar los datos de sesión en el modal de perfil
    document.getElementById("perfilNombre").textContent = "John"; // Reemplazar con el nombre del usuario
    document.getElementById("perfilApellido").textContent = "Doe"; // Reemplazar con el apellido del usuario
    document.getElementById("perfilEmail").textContent = "john.doe@example.com"; // Reemplazar con el correo electrónico del usuario
    console.log("Modal de perfil abierto");
}
