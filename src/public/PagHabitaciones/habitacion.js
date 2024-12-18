document.addEventListener('DOMContentLoaded', function () {
    const submitButton = document.getElementById('submitComment');
    const commentModal = document.getElementById('commentModal');
    const idHabitacion = new URLSearchParams(window.location.search).get('id'); // Obtener el ID de la habitación de la URL
    const addCommentButton = document.getElementById('addCommentButton'); // Botón para abrir el modal
    const closeCommentModalButton = document.querySelector('.close-button'); // Botón para cerrar el modal (la "X")
    const stars = document.querySelectorAll('.star'); // Todas las estrellas
    let selectedRating = 0; // Variable para almacenar la calificación seleccionada


stars.forEach((star, index) => {
    // Evento para seleccionar una calificación al hacer clic
    star.addEventListener('click', () => {
        // Remover la clase 'active' de todas las estrellas
        stars.forEach(s => s.classList.remove('active'));

        // Agregar la clase 'active' a las estrellas seleccionadas hasta el índice actual
        for (let i = 0; i <= index; i++) {
            stars[i].classList.add('active');
        }
    });

    // Evento de hover para resaltar estrellas temporalmente
    star.addEventListener('mouseover', () => {
        // Remover color temporal de todas las estrellas
        stars.forEach(s => s.classList.remove('hovered'));

        // Agregar color de hover a las estrellas hasta el índice actual
        for (let i = 0; i <= index; i++) {
            stars[i].classList.add('hovered');
        }
    });

    // Evento para quitar el color de hover cuando el cursor se aleja
    star.addEventListener('mouseout', () => {
        // Remover la clase 'hovered' de todas las estrellas
        stars.forEach(s => s.classList.remove('hovered'));
    });
});

     // Manejo del clic en las estrellas para seleccionar una calificación
     stars.forEach(star => {
        star.addEventListener('click', function () {
            const starValue = parseInt(this.getAttribute('data-value')); // Obtener el valor de la estrella seleccionada
            selectedRating = starValue; // Asignar la calificación seleccionada

            // Remover la clase 'active' de todas las estrellas
            stars.forEach(s => s.classList.remove('active'));

            // Añadir la clase 'active' a todas las estrellas hasta la seleccionada
            for (let i = 0; i < selectedRating; i++) {
                stars[i].classList.add('active');
            }

            console.log(`Calificación seleccionada: ${selectedRating}`);
        });
    });

    // Abrir el modal al hacer clic en el botón "Añadir comentario"
    if (addCommentButton) {
        addCommentButton.addEventListener('click', () => {
            commentModal.style.display = 'block'; // Mostrar el modal
        });
    }

    // Cerrar el modal al hacer clic en la "X"
    closeCommentModalButton.addEventListener('click', () => {
        commentModal.style.display = 'none'; // Ocultar el modal
    });

    // Cerrar el modal al hacer clic fuera del contenido del modal
    window.addEventListener('click', (event) => {
        if (event.target === commentModal) {
            commentModal.style.display = 'none'; // Ocultar el modal
        }
    });
    // Enviar comentario
    submitButton.addEventListener('click', async function () {
        const commentText = document.getElementById('commentText').value.trim();
        const idUsuario = await obtenerIdUsuario(); // Obtener el ID del usuario de manera asincrónica
        const selectedRating = getSelectedRating(); // Función que obtendrá la calificación seleccionada

        console.log('ID del usuario obtenido:', idUsuario); // Verifica que se obtiene correctamente

        // Validaciones
        if (!idUsuario) {
            showCustomAlert('Debes iniciar sesión para dejar una opinión.',"warning");
            return;
        }
        if (selectedRating <= 0) {
            this.showCustomAlert('Por favor, selecciona una calificación.',"info");
            return;
        }
        if (!commentText) {
            showCustomAlert('Por favor, escribe un comentario.',"info");
            return;
        }

        // Crear el objeto con los datos de la opinión
        const opinionData = {
            id_habitacion: idHabitacion, // ID de la habitación
            calificacion: selectedRating, // Calificación del usuario
            comentario: commentText, // Comentario escrito por el usuario
            id_usuario: parseInt(idUsuario, 10) // Convertir el id_usuario a número
        };

        console.log('Datos a enviar:', opinionData); // Verificar los datos que se van a enviar

        // Enviar la opinión al servidor
        try {
            const response = await fetch('/api/opiniones', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(opinionData)
            });

            const data = await response.json();
            if (response.ok && data.success) {
                showCustomAlert('Comentario añadido con éxito.',"success");
                commentModal.style.display = 'none'; // Cerrar el modal
                clearCommentModal(); // Limpiar el contenido del modal
                fetchResenas(idHabitacion); // Refrescar las reseñas
            } else {
                showCustomAlert('Error al añadir el comentario: ' + data.message,"error");
            }
        } catch (error) {
            console.error('Error al enviar el comentario:', error);
            showCustomAlert('Ocurrió un error al añadir el comentario.',"error");
        }

    });

    // Función para obtener la calificación seleccionada
    function getSelectedRating() {
        const stars = document.querySelectorAll('.star.active');
        return stars.length; // La cantidad de estrellas seleccionadas corresponde a la calificación
    }

    // Función para limpiar el modal de comentarios
    function clearCommentModal() {
        document.getElementById('commentText').value = ''; // Limpiar el campo de texto
        const stars = document.querySelectorAll('.star');
        stars.forEach(star => star.classList.remove('active')); // Limpiar la selección de estrellas
    }
});


// Función para obtener el ID del usuario
async function obtenerIdUsuario() {
    try {
        const response = await fetch('/api/usuario');
        if (!response.ok) {
            throw new Error('No se pudo obtener el ID del usuario');
        }
        const data = await response.json();
        return data.id_usuario; // Devuelve el ID del usuario
    } catch (error) {
        console.error('Error al obtener el ID del usuario:', error);
        return null; // O maneja el error como prefieras
    }
}


// Función para obtener los detalles de la habitación
function fetchHabitacion(id) {
    fetch(`/api/habitaciones/${id}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                renderHabitacion(data.habitacion);
            } else {
                console.error('Error al obtener la habitación:', data.message);
                document.getElementById('habitacionDetailsContainer').innerHTML = '<p>Habitación no encontrada.</p>';
            }
        })
        .catch(error => console.error('Error:', error));
}

// Función para renderizar los detalles de la habitación
function renderHabitacion(habitacion) {
    const container = document.getElementById('habitacionDetailsContainer');
    
    // Agregar el atributo data-habitacion-id con el valor del ID de la habitación
    container.setAttribute('data-habitacion-id', habitacion.id_habitacion);

    // Formatear el precio con separador de miles
    const precioFormateado = parseFloat(habitacion.precio_por_noche).toLocaleString('es-ES', {
        style: 'currency',
        currency: 'COP', // Cambia a la moneda que prefieras
        minimumFractionDigits: 0
    });
    
    container.innerHTML = `
        <div class="habitacion-details-container">
            <div class="habitacion-image-container">
                <img src="${habitacion.imagen_url ? `http://localhost:3000/uploads/${habitacion.imagen_url}` : '../imagenes/default-habitacion.jpg'}" alt="${habitacion.nombre || 'Habitación'}" class="habitacion-image">
            </div>
            <div class="habitacion-info">
                <h1>${habitacion.nombre || 'Nombre no disponible'}</h1>
                <p>Tipo: ${habitacion.tipo_habitacion || 'No disponible'}</p>
                <p>Precio por noche: ${precioFormateado || 'No disponible'}</p>
                <p>Estado: ${habitacion.estado_disponibilidad || 'No disponible'}</p>
                <button id="reservarButton" class="reservar-button">Reservar</button> <!-- Botón de reservar -->
            </div>
        </div>
        <div class="habitacion-descripcion">
            <h2>Descripción</h2>
            <p>${habitacion.descripcion || 'No disponible'}</p>
        </div>
    `;

    // Actualizar el campo oculto con el precio real de la habitación
    document.getElementById('precioPorNoche').value = habitacion.precio_por_noche;

    // Agregar el evento de clic para el botón de reservar
    const reservarButton = document.getElementById('reservarButton');
    reservarButton.addEventListener('click', () => { openReservaModal(habitacion); });

    const imagenUrl = habitacion.imagen_url ? `http://localhost:3000/uploads/${habitacion.imagen_url}` : '../imagenes/404.jpg';
    document.getElementById('modalHabitacionImagen').src = imagenUrl;
}


    
document.addEventListener('DOMContentLoaded', async function () {
    const resenasContainer = document.getElementById('resenasContainer');
    const idHabitacion = new URLSearchParams(window.location.search).get('id'); // Obtener el ID de la habitación de la URL

    // Verificar si el ID de la habitación está disponible
    if (!idHabitacion) {
        resenasContainer.innerHTML = '<p>Error: No se encontró el ID de la habitación.</p>';
        return;
    }

    // Llamar a la función para obtener reseñas
    try {
        await fetchResenas(idHabitacion);
    } catch (error) {
        console.error('Error al cargar las reseñas:', error);
        resenasContainer.innerHTML = '<p>No se pudieron cargar las reseñas.</p>';
    }
});


async function fetchResenas(id) {
    try {
        const response = await fetch(`/api/opiniones?habitacionId=${id}`);
        if (!response.ok) {
            throw new Error('Error en la respuesta del servidor.');
        }
        const data = await response.json();
        if (data.success) {
            renderResenas(data.resenas);
        } else {
            document.getElementById('resenasContainer').innerHTML = '<p>No hay reseñas disponibles.</p>';
        }
    } catch (error) {
        console.error('Error al obtener las reseñas:', error);
        document.getElementById('resenasContainer').innerHTML = '<p>Ocurrió un error al cargar las reseñas.</p>';
    }
}

function renderResenas(resenas) {
    const container = document.getElementById('resenasContainer');

    // Si no hay reseñas, muestra un mensaje
    if (!resenas || resenas.length === 0) {
        container.innerHTML = '<p>No hay reseñas disponibles.</p>';
        return;
    }

    // Renderizar las reseñas
    container.innerHTML = resenas.map(resena => {
        const fechaFormateada = new Date(resena.fecha_opinion).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        return `
        <div class="resena">
            <p><strong>${resena.usuario_nombre || 'Usuario Anónimo'}</strong> - 
            calificación: ${'★'.repeat(resena.calificacion)} 
            <span>${fechaFormateada}</span></p>
            <p>${resena.comentario}</p>
        </div>
        `;
    }).join('');
}


// Definir la función obtenerIdUsuario globalmente
// Función para obtener el ID del usuario desde la sesión en el servidor
async function obtenerIdUsuario() {
    try {
        const response = await fetch('/api/usuario');
        if (!response.ok) {
            throw new Error('No se pudo obtener el ID del usuario');
        }
        const data = await response.json();
        return data.id_usuario; // Devuelve el ID del usuario desde el servidor
    } catch (error) {
        console.error('Error al obtener el ID del usuario:', error);
        return null; // Retorna null en caso de error
    }
}


    async function obtenerDetallesHabitacion(id_habitacion) {
        try {
            const response = await fetch(`/api/habitacion/${id_habitacion}`);
            if (!response.ok) {
                throw new Error('No se pudo obtener la habitación');
            }
            const data = await response.json();
            return data; // Retorna los detalles de la habitación
        } catch (error) {
            console.error('Error al obtener los detalles de la habitación:', error);
            return null; // Retorna null en caso de error
        }
    }

// Función para abrir el modal de reserva

async function openReservaModal(habitacion) {
    const id_usuario = await obtenerIdUsuario(); // Obtener el ID del usuario

    // Verificar si el usuario no está registrado (id_usuario es null o undefined)
    if (!id_usuario) {
        showCustomAlert('Por favor, inicia sesión para realizar una reserva.', "info");
        return; // Detener la ejecución si el usuario no está registrado
    }

    // Verificar que la habitación tenga un ID válido
    if (!habitacion.id_habitacion) {
        console.error('ID de habitación no válido:', habitacion);
        return;
    }

    console.log('ID del Usuario:', id_usuario); 
    console.log('Detalles de la Habitación:', habitacion); 

    // Mostrar el modal si el usuario está registrado
    document.getElementById('reservaModal').style.display = 'block';
}



// Función para cerrar el modal de reserva
function closeReservaModal() {
    const reservaModal = document.getElementById('reservaModal');
    reservaModal.style.display = 'none';
}

// Evento para cerrar el modal al hacer clic fuera del contenido
window.addEventListener('click', (event) => {
    const reservaModal = document.getElementById('reservaModal');
    if (event.target === reservaModal) {
        closeReservaModal();
    }
});


document.addEventListener('DOMContentLoaded', function () {
    // Configura el calendario para fecha de entrada
    flatpickr("#fechaEntrada", {
        dateFormat: "Y-m-d",
        minDate: "today",
        onChange: function(selectedDates, dateStr, instance) {
            const fechaSalidaInput = document.getElementById("fechaSalida");
            fechaSalidaInput._flatpickr.set("minDate", dateStr); // Ajusta la fecha mínima en fecha de salida
            calcularPrecioTotal();
        }
    });

    // Configura el calendario para fecha de salida
    flatpickr("#fechaSalida", {
        dateFormat: "Y-m-d",
        minDate: "today",
        onChange: function() {
            calcularPrecioTotal();
        }
    });
});


// Definir variables globales
let numPersonas = 1;
let precioPorNoche = 0;
let tipoHabitacion = ''; // Mover tipoHabitacion al ámbito global

function calcularPrecioTotal() {
    const fechaEntrada = document.getElementById('fechaEntrada')?.value;
    const fechaSalida = document.getElementById('fechaSalida')?.value;

    if (fechaEntrada && fechaSalida) {
        const fechaInicio = new Date(fechaEntrada);
        const fechaFin = new Date(fechaSalida);

        if (fechaFin <= fechaInicio) {
            showCustomAlert('La fecha de salida debe ser posterior a la fecha de entrada.', "info");
            document.getElementById('precioTotal').textContent = 'Precio Total: $0';
            return;
        }

        const nochesReservadas = Math.ceil((fechaFin - fechaInicio) / (1000 * 60 * 60 * 24));
        let incrementoPersonas = (tipoHabitacion !== 'doble' || numPersonas > 2) ? 1 + (0.20 * (numPersonas - 1)) : 1;
        const precioTotal = nochesReservadas * precioPorNoche * incrementoPersonas;

        const precioTotalFormateado = precioTotal.toLocaleString('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });

        document.getElementById('precioTotal').textContent = `Precio Total: ${precioTotalFormateado}`;
        return precioTotal;
    } else {
        document.getElementById('precioTotal').textContent = 'Precio Total: $0';
        return 0;
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const personasDisplay = document.getElementById("personasDisplay");
    const personasIcons = document.getElementById("personasIcons");
    const incrementarButton = document.getElementById("incrementarPersonas");
    const decrementarButton = document.getElementById("decrementarPersonas");

    const urlParams = new URLSearchParams(window.location.search);
    const idHabitacion = urlParams.get('id');

    async function fetchHabitacion(id) {
        try {
            const response = await fetch(`/api/habitaciones/${id}`);
            const data = await response.json();
            if (data.success) {
                renderHabitacion(data.habitacion);
                inicializarPersonas(data.habitacion.tipo_habitacion, data.habitacion.precio_por_noche);
            } else {
                console.error('Error al obtener detalles de la habitación:', data.message);
            }
        } catch (error) {
            console.error('Error al obtener detalles de la habitación:', error);
        }
    }

    function inicializarPersonas(tipo, precio) {
        tipoHabitacion = tipo; // Asignar el tipo de habitación globalmente
        precioPorNoche = precio; // Asignar el precio de la habitación
        numPersonas = (tipoHabitacion === 'doble') ? 2 : 1;
        actualizarPersonas();
    }

    function actualizarPersonas() {
        personasDisplay.textContent = numPersonas;
        personasIcons.innerHTML = "";
        for (let i = 0; i < numPersonas; i++) {
            const icon = document.createElement("i");
            icon.classList.add("fas", "fa-user");
            personasIcons.appendChild(icon);
        }
        calcularPrecioTotal();
    }

    flatpickr("#fechaEntrada", {
        dateFormat: "Y-m-d",
        minDate: "today",
        onChange: function(selectedDates, dateStr, instance) {
            document.getElementById("fechaSalida")._flatpickr.set("minDate", dateStr);
            calcularPrecioTotal();
        }
    });

    flatpickr("#fechaSalida", {
        dateFormat: "Y-m-d",
        minDate: "today",
        onChange: function() {
            calcularPrecioTotal();
        }
    });

    incrementarButton?.addEventListener("click", (event) => {
        event.preventDefault(); 
        if (numPersonas < 4) {
            numPersonas++;
            actualizarPersonas();
        } else {
            showCustomAlert("El máximo es 4 personas por habitación.");
        }
    });

    decrementarButton?.addEventListener("click", (event) => {
        event.preventDefault(); 
        if (numPersonas > 1 && (tipoHabitacion !== 'doble' || numPersonas > 2)) {
            numPersonas--;
            actualizarPersonas();
        } else if (tipoHabitacion === 'doble' && numPersonas === 2) {
            showCustomAlert("El mínimo es 2 personas para una habitación doble.");
        }
    });

    fetchHabitacion(idHabitacion);
});

// Variables globales para almacenar los datos de la reserva temporalmente
let reservaData = {};

document.addEventListener('DOMContentLoaded', function () {
    const confirmarReservaBtn = document.getElementById('confirmarReservaBtn');
    if (confirmarReservaBtn) {
        confirmarReservaBtn.addEventListener('click', async function () {
            try {
                const fechaEntrada = document.getElementById('fechaEntrada').value;
                const fechaSalida = document.getElementById('fechaSalida').value;
                const idHabitacion = document.getElementById('habitacionDetailsContainer').getAttribute('data-habitacion-id');
                const idUsuario = await obtenerIdUsuario();

                if (!idUsuario) {
                    window.location.href = '/usuario/index.html?loginModal=true';
                    return;
                }

                // Validaciones de fechas
                if (new Date(fechaEntrada) < new Date()) {
                    showCustomAlert('La fecha de entrada no puede ser menor a la fecha actual.', "info");
                    return;
                }
                if (!fechaEntrada || !fechaSalida || !idHabitacion) {
                    showCustomAlert('Faltan datos. Por favor, asegúrate de que toda la información esté completa.', "error");
                    return;
                }

                const precioTotal = calcularPrecioTotal();
                const reservaData = {
                    id_usuario: idUsuario,
                    id_habitacion: idHabitacion,
                    fecha_entrada: fechaEntrada,
                    fecha_salida: fechaSalida,
                    numero_personas: numPersonas,
                    precio_total: precioTotal || 0
                };

                // Enviar reserva al servidor
                const reservaResponse = await fetch('/api/reservas', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(reservaData)
                });

                const reservaResult = await reservaResponse.json();
                if (reservaResponse.ok && reservaResult.id_reserva) {
                    iniciarPagoSimulado();

                    // Llamar al endpoint para enviar el correo de confirmación con el PDF
                    const confirmacionResponse = await fetch(`/api/enviar-confirmacion/${reservaResult.id_reserva}`, { method: 'POST' });
                    const confirmacionResult = await confirmacionResponse.json();
                    
                    if (confirmacionResponse.ok) {
                        console.log('Correo de confirmación enviado:', confirmacionResult.message);
                        showCustomAlert("Reserva confirmada. Se ha enviado una copia de la factura a tu correo.", "success");
                    } else {
                        console.error('Error al enviar el correo de confirmación:', confirmacionResult.message);
                        showCustomAlert('Error al enviar el correo de confirmación. Verifica tu correo.', "error");
                    }
                } else {
                    console.error('Error en la confirmación de reserva:', reservaResult.message);
                    showCustomAlert('Error al confirmar la reserva: ' + reservaResult.message, "error");
                }
            } catch (error) {
                console.error('Error en la solicitud de confirmación de reserva:', error);
                showCustomAlert('Hubo un problema al confirmar la reserva. Por favor, intenta de nuevo.', "error");
            }
        });
    }
});

function iniciarPagoSimulado() {
    const pagoAlerta = document.getElementById('pagoAlerta');
    const confirmarPagoBtn = document.getElementById('confirmarPagoBtn');
    const circulo = document.querySelector('.circulo');
    const chulito = document.querySelector('.chulito');
    const estadoPago = document.getElementById('estadoPago'); // Texto de estado

    // Mostrar modal y ocultar botón "Aceptar" inicialmente
    pagoAlerta.style.display = 'flex';
    confirmarPagoBtn.style.display = 'none';
    circulo.classList.remove('hide');
    chulito.style.display = 'none';

    setTimeout(() => {
        circulo.classList.add('hide'); // Oculta el círculo de carga
        estadoPago.textContent = 'Pago confirmado. Se envió una copia al correo';
        chulito.style.display = 'block'; // Muestra el chulito de confirmación
        confirmarPagoBtn.style.display = 'block'; // Muestra el botón de confirmar

        // Evento para confirmar el pago y cerrar modales
        confirmarPagoBtn.onclick = () => {
            pagoAlerta.style.display = 'none';
            closeReservaModal(); // Llama a la función que cierra el modal de reserva
        };
    }, 5000); // Espera 5 segundos
}

async function registrarPago(id_reserva) {
    const pagoData = {
        id_reserva: id_reserva,
        monto_total: calcularPrecioTotal(),
        metodo_pago: "tarjeta de crédito",
        estado_pago: "aprobado"
    };

    try {
        const response = await fetch('/api/payment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(pagoData)
        });

        if (response.ok) {
            showCustomAlert('Pago registrado con éxito.', 'success');
        } else {
            showCustomAlert('Error al registrar el pago.', 'error');
        }
    } catch (error) {
        console.error('Error al enviar los datos de pago:', error);
        showCustomAlert('Ocurrió un error al procesar el pago.', 'error');
    }
}




// Función para mostrar una alerta personalizada
function showCustomAlert(message, type = 'info', duration = 3000) {
    const alert = document.createElement('div');
    alert.classList.add('custom-alert', type); // Tipo: success, warning, info, error
    alert.innerHTML = `
        <span>${message}</span>
        <button class="close-btn" onclick="closeCustomAlert(this)">&times;</button>
    `;

    document.body.appendChild(alert);
    setTimeout(() => alert.classList.add('show'), 100); // Animación de aparición

    // Ocultar alerta automáticamente después del tiempo especificado
    setTimeout(() => closeCustomAlert(alert), duration);
}

// Función para cerrar una alerta específica
function closeCustomAlert(alert) {
    alert.classList.remove('show');
    alert.classList.add('hide');
    setTimeout(() => alert.remove(), 500); // Eliminar después de la animación
}
        
function toggleDarkMode() {
    const body = document.body;
    body.classList.toggle('dark-mode');
    const footer = document.querySelector('footer');

    footer.classList.toggle('dark-mode');
    // Cambiar el ícono en todos los botones de modo oscuro
    const darkModeToggles = document.querySelectorAll(".dark-mode-toggle");
    darkModeToggles.forEach(toggle => {
        toggle.innerHTML = body.classList.contains('dark-mode')
            ? '<i class="fas fa-sun"></i>' // Ícono de sol para modo oscuro
            : '<i class="fas fa-moon"></i>'; // Ícono de luna para modo claro
    });

    // Guardar el estado en localStorage
    localStorage.setItem('darkMode', body.classList.contains('dark-mode') ? 'enabled' : 'disabled');
}
document.addEventListener('DOMContentLoaded', () => {
    // Consultar el estado de modo oscuro en localStorage
    const darkModeState = localStorage.getItem('darkMode');

    // Si el estado está activado, aplicar la clase dark-mode
    if (darkModeState === 'enabled') {
        document.body.classList.add('dark-mode');
    }

    // Asegurar que el ícono refleje el estado correcto en todos los botones
    const darkModeToggles = document.querySelectorAll(".dark-mode-toggle");
    darkModeToggles.forEach(toggle => {
        toggle.innerHTML = document.body.classList.contains('dark-mode')
            ? '<i class="fas fa-sun"></i>'
            : '<i class="fas fa-moon"></i>';
    });
});

function toggleSocialMedia() {
    const socialMediaContainer = document.getElementById("socialMediaContainer");
    socialMediaContainer.classList.toggle("show-social-media");
}

// Cierra el contenedor de redes sociales al hacer clic fuera
document.addEventListener("click", (event) => {
    const socialMediaContainer = document.getElementById("socialMediaContainer");
    const socialMediaButton = document.getElementById("socialMediaButton");

    if (!socialMediaButton.contains(event.target) && !socialMediaContainer.contains(event.target)) {
        socialMediaContainer.classList.remove("show-social-media");
    }
});
let isDropdownOpen = false;

const mainButton = document.getElementById("mainButton");
const dropdownButtons = document.getElementById("dropdownButtons");

function toggleDropdown() {
    isDropdownOpen = !isDropdownOpen;
    dropdownButtons.classList.toggle("show", isDropdownOpen);
}

// Desplegar al pasar el cursor, pero solo cerrar si no se ha hecho clic
mainButton.addEventListener("mouseenter", () => {
    if (!isDropdownOpen) {
        dropdownButtons.classList.add("show");
    }
});

// Cerrar el menú cuando se quita el cursor si no está anclado
mainButton.addEventListener("mouseleave", () => {
    if (!isDropdownOpen) {
        dropdownButtons.classList.remove("show");
    }
});