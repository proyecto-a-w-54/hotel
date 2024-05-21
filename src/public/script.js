// scripts.js

// Obtener el precio por noche de la habitación (aquí podrías obtenerlo dinámicamente desde una base de datos)
var precioEstándar = 100;
var precioDeluxe = 200;
var precioViajero = 150;


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
// Función para validar si se ha iniciado sesión al intentar hacer una reserva
function openReservaModal() {
    var usuarioLogueado = false; // Supongamos que inicialmente el usuario no ha iniciado sesión

    // Aquí puedes agregar la lógica para verificar si el usuario está logueado
    // Por ejemplo, podrías tener una variable global que indique si el usuario ha iniciado sesión o no

    if (usuarioLogueado) {
        // Si el usuario ha iniciado sesión, abrir el modal de reserva
        openReservaModal();
    } else {
        // Si el usuario no ha iniciado sesión, mostrar un mensaje o redirigir al modal de inicio de sesión
        alert("Debes iniciar sesión para hacer una reserva.");
        openLoginModal(); // Abre el modal de inicio de sesión
    }
}
document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/habitaciones')
        .then(response => response.json())
        .then(data => {
            const habitacionesContainer = document.getElementById('habitaciones-container');
            habitacionesContainer.innerHTML = ''; // Limpiar el contenedor antes de agregar nuevas habitaciones

            data.forEach(habitacion => {
                const habitacionDiv = document.createElement('div');
                habitacionDiv.classList.add('habitacion-container');

                habitacionDiv.innerHTML = `
                    <div class="habitacion-imagen-container">
                        <h2 class="habitacion-titulo">${habitacion.nombre}</h2>
                        <img class="habitacion-imagen" src="${habitacion.imagen}" alt="${habitacion.nombre}">
                    </div>
                    <div class="habitacion-info">
                        <p class="habitacion-descripcion">${habitacion.descripcion}</p>
                        <button class="habitacion-btn" onclick="openReservaModal(${habitacion.precio}, '${habitacion.imagen}')">Reservar - $${habitacion.precio}k</button>
                    </div>
                `;
                habitacionesContainer.appendChild(habitacionDiv);
            });
        })
        .catch(error => console.error('Error al cargar las habitaciones:', error));
});

function reservaModal(precio, imagen) {
    document.getElementById('precioPorNoche').value = precio;
    document.querySelector('#reservaModal .habitacion-imagen').src = imagen;
    calcularPrecioTotal();
    document.getElementById('reservaModal').style.display = 'block';
}

function closeReservaModal() {
    document.getElementById('reservaModal').style.display = 'none';
}

function calcularPrecioTotal() {
    const precioPorNoche = document.getElementById('precioPorNoche').value;
    const fechaEntrada = new Date(document.getElementById('fechaEntrada').value);
    const fechaSalida = new Date(document.getElementById('fechaSalida').value);
    const numPersonas = document.getElementById('numPersonas').value;

    if (!isNaN(fechaEntrada) && !isNaN(fechaSalida)) {
        const diffTime = Math.abs(fechaSalida - fechaEntrada);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const precioTotal = diffDays * precioPorNoche * numPersonas;

        document.getElementById('precioTotal').textContent = `Precio Total: $${precioTotal}k`;
    } else {
        document.getElementById('precioTotal').textContent = 'Precio Total: -';
    }
}

function confirmarReserva() {
    alert('Reserva confirmada!');
}

