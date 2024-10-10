document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const idHabitacion = urlParams.get('id'); // Obtener el ID de la habitación de la URL

    fetchHabitacion(idHabitacion); // Llamar a la función para obtener los detalles de la habitación
});

function fetchHabitacion(id) {
    fetch(`/api/habitaciones/${id}`) // Llamar al endpoint para obtener la habitación por ID
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
function renderHabitacion(habitacion) {
    const container = document.getElementById('habitacionDetailsContainer');
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
                <div class="reservar-container">
                    <button class="reservar-button">Reservar</button>
                </div>
            </div>
        </div>
        <div class="habitacion-descripcion">
            <h2>Descripción</h2>
            <p>${habitacion.descripcion || 'No disponible'}</p>
        </div>
        
    `;
}



