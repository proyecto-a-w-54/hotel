       document.addEventListener('DOMContentLoaded', function () {
            // Llamar a la función para cargar habitaciones al iniciar
            fetchHabitaciones();
        });
        
        function fetchHabitaciones() {
            fetch('/api/habitaciones') // Asegúrate de que este endpoint sea el correcto
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
        
        function renderHabitaciones(habitaciones) {
            const roomListContainer = document.getElementById('roomListContainerHabitaciones');
            roomListContainer.innerHTML = ''; // Limpiar el contenedor
        
            habitaciones.forEach(habitacion => {
                const imageUrl = habitacion.imagen_url ? `http://localhost:3000/uploads/${habitacion.imagen_url}` : '../imagenes/habitacion1.jpeg';
        
                const div = document.createElement('div');
                div.className = 'card-item'; // Clase para el estilo de carta
                div.onclick = () => goToHabitacionPage(habitacion.id_habitacion); // Hacer la tarjeta clickeable
        
                div.innerHTML = `
                    <img src="${imageUrl}" alt="${habitacion.tipo_habitacion}" class="card-image">
                    <div class="card-body">
                        <h5>${habitacion.nombre || 'Nombre no disponible'}</h5>
                        <p>Tipo: ${habitacion.tipo_habitacion || 'No disponible'}</p>
                        <p>Precio por noche: ${habitacion.precio_por_noche || 'No disponible'}</p>
                        <p>Estado: ${habitacion.estado_disponibilidad || 'No disponible'}</p>
                    </div>
                `;
                roomListContainer.appendChild(div);
            });
        }
        
        function goToHabitacionPage(habitacionId) {
            window.location.href = `/pagHabitaciones/habitacion.html?id=${habitacionId}`; // Cambia esto a la URL correcta
        }
        