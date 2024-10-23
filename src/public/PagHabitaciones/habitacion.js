document.addEventListener('DOMContentLoaded', function () {
    const submitButton = document.getElementById('submitComment');
    const commentModal = document.getElementById('commentModal');
    const idHabitacion = new URLSearchParams(window.location.search).get('id'); // Obtener el ID de la habitación de la URL
    const addCommentButton = document.getElementById('addCommentButton'); // Botón para abrir el modal
    const closeCommentModalButton = document.querySelector('.close-button'); // Botón para cerrar el modal (la "X")
    const stars = document.querySelectorAll('.star'); // Todas las estrellas
    let selectedRating = 0; // Variable para almacenar la calificación seleccionada

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
            alert('Debes iniciar sesión para dejar una opinión.');
            return;
        }
        if (selectedRating <= 0) {
            alert('Por favor, selecciona una calificación.');
            return;
        }
        if (!commentText) {
            alert('Por favor, escribe un comentario.');
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
                alert('Comentario añadido con éxito.');
                commentModal.style.display = 'none'; // Cerrar el modal
                clearCommentModal(); // Limpiar el contenido del modal
                fetchResenas(idHabitacion); // Refrescar las reseñas
            } else {
                alert('Error al añadir el comentario: ' + data.message);
            }
        } catch (error) {
            console.error('Error al enviar el comentario:', error);
            alert('Ocurrió un error al añadir el comentario.');
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
    
    container.innerHTML = `
        <div class="habitacion-details-container">
            <div class="habitacion-image-container">
                <img src="${habitacion.imagen_url ? `http://localhost:3000/uploads/${habitacion.imagen_url}` : '../imagenes/default-habitacion.jpg'}" alt="${habitacion.nombre || 'Habitación'}" class="habitacion-image">
            </div>
            <div class="habitacion-info">
                <h1>${habitacion.nombre || 'Nombre no disponible'}</h1>
                <p>Tipo: ${habitacion.tipo_habitacion || 'No disponible'}</p>
                <p>Precio por noche: ${habitacion.precio_por_noche || 'No disponible'}</p>
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
}

    


// Función para obtener las reseñas de la habitación
function fetchResenas(id) {
    fetch(`/api/opiniones?habitacionId=${id}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error en la respuesta de la red');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                renderResenas(data.resenas);
            } else {
                console.error('Error al obtener reseñas:', data.message);
                document.getElementById('resenasContainer').innerHTML = '<p>No se encontraron reseñas.</p>';
            }
        })
        .catch(error => console.error('Error al obtener las reseñas:', error));
}


// Función para renderizar las reseñas en el contenedor
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
        }); // Formatear la fecha para mostrar solo día, mes y año en español

        return `
        <div class="resena">
            <p><strong>${resena.usuario_nombre || 'Usuario Anónimo'}</strong> - 
            calificación: ${'★'.repeat(resena.calificacion)} 
            <span>${fechaFormateada}</span></p> <!-- Mostrar la fecha formateada -->
            <p>${resena.comentario}</p>
        </div>
        `;
    }).join('');
}


// Definir la función obtenerIdUsuario globalmente
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

    if (!habitacion.id_habitacion) {
        console.error('ID de habitación no válido:', habitacion);
        return;
    }

    console.log('ID del Usuario:', id_usuario); 
    console.log('Detalles de la Habitación:', habitacion); 

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

// Función para calcular el precio total (debe estar fuera de DOMContentLoaded para ser accesible globalmente)
function calcularPrecioTotal() {
    const fechaEntrada = document.getElementById('fechaEntrada').value;
    const fechaSalida = document.getElementById('fechaSalida').value;
    const numPersonas = parseInt(document.getElementById('numPersonas').value);
    const precioPorNoche = parseFloat(document.getElementById('precioPorNoche').value);

    if (fechaEntrada && fechaSalida) {
        const fechaInicio = new Date(fechaEntrada);
        const fechaFin = new Date(fechaSalida);

        if (fechaFin <= fechaInicio) {
            alert('La fecha de salida debe ser posterior a la fecha de entrada.');
            document.getElementById('precioTotal').textContent = 'Precio Total: $0';
            return;
        }

        const diasReservados = Math.ceil((fechaFin - fechaInicio) / (1000 * 60 * 60 * 24));

        let incrementoPersonas = 1;
        if (numPersonas > 1) {
            incrementoPersonas = 1 + (0.20 * (numPersonas - 1));
        }

        const precioTotal = diasReservados * precioPorNoche * incrementoPersonas;
        document.getElementById('precioTotal').textContent = `Precio Total: $${precioTotal.toFixed(2)}`;
    } else {
        document.getElementById('precioTotal').textContent = 'Precio Total: $0';
    }
}
document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const idHabitacion = urlParams.get('id');

    fetchHabitacion(idHabitacion); // Obtener los detalles de la habitación
    fetchResenas(idHabitacion); // Obtener las reseñas de la habitación

    // Configurar el botón de confirmar reserva
    document.getElementById('confirmarReservaBtn').addEventListener('click', async function () {
        const fechaEntrada = document.getElementById('fechaEntrada').value;
        const fechaSalida = document.getElementById('fechaSalida').value;
        const numPersonas = parseInt(document.getElementById('numPersonas').value);
        const precioTotal = document.getElementById('precioTotal').textContent.replace('Precio Total: $', '');
        const idUsuario = localStorage.getItem('id_usuario'); // Obtener el ID del usuario de la sesión
        const idHabitacion = document.getElementById('habitacionDetailsContainer').getAttribute('data-habitacion-id');

        // Validar si hay un usuario logueado
        if (!idUsuario) {
            window.location.href = '/usuario/index.html?loginModal=true'; // Redirigir y pasar el parámetro para abrir el modal
            return;
        }
        

        // Validar que la fecha de entrada no sea menor a la fecha actual
        const fechaActual = new Date();
        const entradaDate = new Date(fechaEntrada);
        const salidaDate = new Date(fechaSalida);

        if (entradaDate < fechaActual) {
            alert('La fecha de entrada no puede ser menor a la fecha actual.');
            return;
        }

        // Validar que la fecha de salida no sea superior a 30 días a partir de la fecha actual
        const maxFechaSalida = new Date();
        maxFechaSalida.setDate(maxFechaSalida.getDate() + 30);

        if (salidaDate > maxFechaSalida) {
            alert('La fecha de salida no puede ser superior a 30 días a partir de la fecha actual.');
            return;
        }

        // Verificar que los datos necesarios estén presentes
        if (!fechaEntrada || !fechaSalida || !idHabitacion) {
            alert('Faltan datos. Por favor, asegúrate de que todas las informaciones estén completas.');
            return;
        }

        // Crear el objeto con los datos de la reserva
        const reservaData = {
            id_usuario: idUsuario,
            id_habitacion: idHabitacion,
            fecha_entrada: fechaEntrada,
            fecha_salida: fechaSalida,
            numero_personas: numPersonas,
            precio_total: parseFloat(precioTotal)
        };

        console.log('Datos de la reserva que se enviarán al servidor:', reservaData);

        // Enviar la reserva al servidor
        try {
            const response = await fetch('/api/reservas', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(reservaData)
            });

            const result = await response.json();

            if (response.ok) {
                alert('Reserva confirmada con éxito.');
            } else {
                alert('Error al confirmar la reserva: ' + result.message);
            }
        } catch (error) {
            console.error('Error al enviar la reserva:', error);
            alert('Ocurrió un error al confirmar la reserva.');
        }
    });
});
