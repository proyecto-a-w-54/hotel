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
            
        function toggleDarkMode() {
            const body = document.body;
            body.classList.toggle('dark-mode');
        
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