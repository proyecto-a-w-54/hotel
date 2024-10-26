// Escuchar cuando el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function () {
    // Llamar a la función para cargar los detalles del hotel
    fetchHotelDetails();
});

// Función para obtener los detalles del hotel
function fetchHotelDetails() {
    // Obtener el ID del hotel de la URL
    const params = new URLSearchParams(window.location.search);
    const id_hotel = params.get('id'); // Obtener el ID del parámetro de la URL

    if (id_hotel) {
        // Hacer una solicitud a la API para obtener los datos del hotel
        fetch(`/api/hoteles/${id_hotel}`) // Endpoint para obtener un hotel específico
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    renderHotelDetails(data.hotel); // Llamar a la función para renderizar los detalles del hotel
                } else {
                    console.error('Error al obtener el hotel:', data.message);
                }
            })
            .catch(error => console.error('Error:', error));
    } else {
        console.error('No se proporcionó el ID del hotel.');
    }
}

// Función para renderizar los detalles del hotel en el HTML
function renderHotelDetails(hotel) {
    const hotelContainer = document.getElementById('hotelDetailsContainer'); // Asegúrate de tener este contenedor en el HTML

    // Usar los datos del hotel para llenar el contenido
    const imageUrl = hotel.foto ? `http://localhost:3000/uploads/${hotel.foto}` : '../imagenes/habitacion1.jpeg'; // Imagen por defecto
    const estrellas = renderStars(hotel.calificacion_promedio || 0); // Función para generar estrellas

    hotelContainer.innerHTML = `
        <div class="container">
            <h1>${hotel.nombre_hotel || 'Nombre no disponible'}</h1>
            <img src="${imageUrl}" alt="${hotel.nombre_hotel}" id="hotelImagen">
            <div class="detalles">
                <h2>Descripción</h2>
                <p><strong>Dirección:</strong> ${hotel.direccion || 'No disponible'}</p>
            </div>
            <div class="calificacion">
                ${estrellas}
                <span class="rating-value">${hotel.calificacion_promedio || 'No disponible'}</span>
            </div>
            <div class="descripcion">
                <p>${hotel.descripcion || 'No disponible'}</p>
            </div>
        </div>
    `;
}


// Función auxiliar para generar estrellas según la calificación
function renderStars(calificacion) {
    let estrellasHTML = '';
    const totalEstrellas = 5;

    for (let i = 1; i <= totalEstrellas; i++) {
        if (i <= calificacion) {
            estrellasHTML += '<span class="star">&#9733;</span>'; // Estrella llena
        } else {
            estrellasHTML += '<span class="star">&#9734;</span>'; // Estrella vacía
        }
    }

    return estrellasHTML;
}

// Escuchar cuando el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function () {
    fetchHotelDetails(); // Cargar los detalles del hotel al iniciar
});

// Función para obtener los detalles del hotel
function fetchHotelDetails() {
    const params = new URLSearchParams(window.location.search);
    const id_hotel = params.get('id');

    if (id_hotel) {
        // Obtener los detalles del hotel
        fetch(`/api/hoteles/${id_hotel}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    renderHotelDetails(data.hotel); // Renderizar los detalles del hotel
                    fetchHabitaciones(id_hotel); // Cargar las habitaciones del hotel
                } else {
                    console.error('Error al obtener el hotel:', data.message);
                }
            })
            .catch(error => console.error('Error:', error));
    } else {
        console.error('No se proporcionó el ID del hotel.');
    }
}

// Función para obtener y renderizar habitaciones de un hotel específico
function fetchHabitaciones(hotelId) {
    fetch(`/api/hoteles/${hotelId}/habitaciones`)
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

// Función para renderizar las habitaciones en el contenedor
function renderHabitaciones(habitaciones) {
    const roomListContainer = document.getElementById('roomListContainerHabitaciones');
    roomListContainer.innerHTML = '';

    habitaciones.forEach(habitacion => {
        const imageUrl = habitacion.imagen_url ? `http://localhost:3000/uploads/${habitacion.imagen_url}` : '../imagenes/habitacion1.jpeg';
        const div = document.createElement('div');
        div.className = 'card-item';
        div.onclick = () => goToHabitacionPage(habitacion.id_habitacion);
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

// Redirigir a la página de la habitación seleccionada
function goToHabitacionPage(habitacionId) {
    window.location.href = `/pagHabitaciones/habitacion.html?id=${habitacionId}`;
}
function showCustomAlert(message, type = "info") {
    const alertContainer = document.createElement('div');
    alertContainer.className = `custom-alert ${type}`;
    alertContainer.innerText = message;

    // Agregar animación de entrada y salida
    alertContainer.classList.add('show');
    document.body.appendChild(alertContainer);

    // Animación para ocultar automáticamente después de 3 segundos
    setTimeout(() => {
        alertContainer.classList.remove('show');
        alertContainer.classList.add('hide');
        setTimeout(() => alertContainer.remove(), 500);
    }, 3000);
}
