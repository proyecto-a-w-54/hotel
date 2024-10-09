        // Función para mostrar/ocultar el sidebar
        function toggleSidebar() {
            const sidebar = document.getElementById('sidebar');
            sidebar.classList.toggle('open');
        }

        // Función para cerrar el sidebar al hacer clic fuera de él
        document.addEventListener('click', function(event) {
            const sidebar = document.getElementById('sidebar');
            const toggleButton = event.target.closest('a[onclick="toggleSidebar()"]'); // Detectar si hizo clic en el botón de tres rayas

            if (!sidebar.contains(event.target) && !toggleButton && sidebar.classList.contains('open')) {
                sidebar.classList.remove('open'); // Cerrar el sidebar si el clic es fuera
            }
        });
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
            const roomListContainer = document.getElementById('roomListContainer');
            roomListContainer.innerHTML = ''; // Limpiar el contenedor
        
            habitaciones.forEach(habitacion => {
                const imageUrl = habitacion.imagen_url ? `http://localhost:3000/uploads/${habitacion.imagen_url}` : 'default-image.png';
                const div = document.createElement('div');
                div.className = 'habitacion-item';
                div.innerHTML = `
                    <img src="${imageUrl}" alt="${habitacion.tipo_habitacion}" class="habitacion-image">
                    <div class="habitacion-details">
                        <h2>${habitacion.nombre || 'Nombre no disponible'}</h2>
                        <p>${habitacion.tipo_habitacion}</p>
                        <p>${habitacion.descripcion}</p>
                        <p>Precio por noche: ${habitacion.precio_por_noche}</p>
                        <p>Estado: ${habitacion.estado_disponibilidad}</p>
                    </div>
                `;
                roomListContainer.appendChild(div);
            });
        }