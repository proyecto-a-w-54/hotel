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
    const hotelContainer = document.getElementById('hotelDetailsContainer'); // Asumiendo que tienes un contenedor en el HTML para mostrar los detalles

    // Usar los datos del hotel para llenar el contenido
    const imageUrl = hotel.imagen_url ? `http://localhost:3000/uploads/${hotel.imagen_url}` : '../imagenes/habitacion1.jpeg'; // Imagen por defecto
    hotelContainer.innerHTML = `
        <h1>${hotel.nombre_hotel || 'Nombre no disponible'}</h1>
        <img src="${imageUrl}" alt="${hotel.nombre_hotel}" class="hotel-image">
        <p>Dirección: ${hotel.direccion || 'No disponible'}</p>
        <p>Categoría: ${hotel.categoria || 'No disponible'}</p>
        <p>Calificación: ${hotel.calificacion_promedio || 'No disponible'}</p>
        <p>Número de Habitaciones: ${hotel.numero_habitaciones || 'No disponible'}</p>
        <p>Descripción: ${hotel.descripcion || 'No disponible'}</p>
    `;
}
