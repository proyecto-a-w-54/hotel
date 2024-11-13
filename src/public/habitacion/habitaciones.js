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
        
            const randomRooms = habitaciones.sort(() => 0.5 - Math.random()).slice(0, 7); // Selección aleatoria
        
            randomRooms.forEach(habitacion => {
                const imageUrl = habitacion.imagen_url ? `http://localhost:3000/uploads/${habitacion.imagen_url}` : '../imagenes/habitacion1.jpeg';
                const div = document.createElement('div');
                div.className = 'card-item'; // Clase para el estilo de carta
                div.onclick = () => goToHabitacionPage(habitacion.id_habitacion); // Hacer la tarjeta clickeable
        
                // Formatear el precio con separador de miles
                const precioFormateado = parseFloat(habitacion.precio_por_noche).toLocaleString('es-ES', {
                    style: 'currency',
                    currency: 'COP', // Puedes cambiarlo a la moneda que prefieras
                    minimumFractionDigits: 0
                });
        
                div.innerHTML = `
                    <img src="${imageUrl}" alt="${habitacion.tipo_habitacion}" class="card-image">
                    <div class="card-body">
                        <h5>${habitacion.nombre || 'Nombre no disponible'}</h5>
                        <p>Tipo: ${habitacion.tipo_habitacion}</p>
                        <p>Precio por noche: ${precioFormateado}</p>
                        <p>Estado: ${habitacion.estado_disponibilidad}</p>
                    </div>
                `;
                roomListContainer.appendChild(div);
            });
        }
        
        
        function goToHabitacionPage(habitacionId) {
            window.location.href = `/pagHabitaciones/habitacion.html?id=${habitacionId}`; // Cambia esto a la URL correcta
        }
        
        document.getElementById('gridViewIcon').addEventListener('click', () => setView('grid'));
        document.getElementById('listViewIcon').addEventListener('click', () => setView('list'));
        
        function setView(viewType) {
            const container = document.getElementById('roomListContainerHabitaciones');
            if (viewType === 'grid') {
                container.classList.remove('list-view');
                container.classList.add('grid-view');
            } else {
                container.classList.remove('grid-view');
                container.classList.add('list-view');
            }
        }
        