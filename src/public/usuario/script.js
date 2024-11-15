
// Variable para gestionar el estado de sesión del usuario
let usuarioLogueado = false;
let userID = null;



function openProfileModal() {
    const modal = document.getElementById("perfilModal");
    modal.style.display = "block";

    // Hacer una solicitud al servidor para obtener la información del usuario
    fetch('/api/user')
        .then(response => response.json())
        .then(data => {
            if (data.user) {
                // Llenar los campos del perfil con la información del usuario
                document.getElementById("perfilNombre").textContent = data.user.nombre;
                document.getElementById("perfilApellido").textContent = data.user.apellido;
                document.getElementById("perfilEmail").textContent = data.user.correo_electronico;
                // Llamar a la función para mostrar las reservas en el modal
                renderReservas(data.reservas);
            } else {
                console.error('No se pudo obtener la información del usuario.');
            }
        })
        .catch(error => {
            console.error('Error al obtener la información del usuario:', error);
        });
}



// Función para ocultar el modal de reserva
function closeReservaModal() {
    const modal = document.getElementById("reservaModal");
    modal.style.display = "none";
}


function openLoginModal() {
    const modal = document.getElementById("loginModal");
    modal.style.display = "block";
}

function closeLoginModal() {
    const modal = document.getElementById("loginModal");
    modal.style.display = "none";
}

function loginUser(event) {
    event.preventDefault();

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    // Verificar si los campos están completos
    if (!email || !password) {
        showCustomAlert('Por favor, ingresa el correo electrónico y la contraseña.', "info");
        return;
    }

    fetch('/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ correo_electronico: email, contrasena: password })
    })
    .then(response => {
        // Verificar si la respuesta es exitosa
        if (!response.ok) {
            throw new Error('Error al iniciar sesión: ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        if (data.message === 'Inicio de sesión exitoso') {
            // Guardar el userId en localStorage
            localStorage.setItem('userId', data.userId);

            // Cargar los datos del usuario después del login
            fetchUserData(data.userId);

            // Redirigir a la página adecuada o actualizar la UI
            if (data.redirect) {
                window.location.href = data.redirect;
            } else {
                closeLoginModal();
                updateUIOnLogin();
            }
        } else {
            showCustomAlert('Error al iniciar sesión: ' + data.message, "error");
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showCustomAlert('Error al iniciar sesión. Por favor, intenta de nuevo.', "error");
    });
}


document.getElementById("loginForm").addEventListener("submit", loginUser);

window.onload = () => {
    // Verificar si el userId ya está guardado en localStorage
    const storedUserId = localStorage.getItem('userId');
    
    if (storedUserId) {
        // Si hay un ID de usuario almacenado, verificar la sesión en el servidor
        checkSession();
    } else {
        // Si no hay ningún ID almacenado, asegúrate de que la sesión no esté activa
        usuarioLogueado = false;
        updateUIOnLogin(); // Asegurarte de que la interfaz se actualiza como si no hubiera sesión
    }

    // Verificar la sesión cada 5 minutos
    setInterval(checkSession, 300000);
};

function checkSession() {
    fetch('/api/check-session')
        .then(response => response.json())
        .then(data => {
            if (data.loggedIn) {
                // Si la sesión está activa, asegurarse de que los datos se actualizan correctamente
                console.log('Sesión activa. Usuario ID:', data.userId);
                usuarioLogueado = true; 
                userID = data.userId;
                localStorage.setItem('userId', data.userId); // Asegurarte de que el ID se almacena
                updateUIOnLogin();

                // Cargar los datos del usuario automáticamente si está logueado
                fetchUserData(userID);  // Cargar los datos del perfil del usuario al iniciar sesión
            } else {
                // Si no hay sesión activa, asegurarse de que el estado se restablece
                console.log('No hay sesión activa. Redirigiendo al login.');
                usuarioLogueado = false;
                userID = null;
                localStorage.removeItem('userId'); // Eliminar el ID almacenado
                updateUIOnLogin();
            }
        })
        .catch(error => {
            console.error('Error al verificar la sesión:', error);
        });
}

function updateUIOnLogin() {
    const loginNavItem = document.getElementById("loginNavItem");
    const logoutNavItem = document.getElementById("logoutNavItem");
    const userId = localStorage.getItem('userId'); 

    if (usuarioLogueado) {
        loginNavItem.style.display = "none"; // Ocultar "Iniciar sesión"
        logoutNavItem.style.display = "inline-block"; // Mostrar "Cerrar sesión"
        document.getElementById('user-info').style.display = 'block';

        // Asegurarse de que los datos del perfil están cargados
        if (userId) {
            fetchUserData(userId);  // Cargar los datos del usuario en la barra lateral
        }
    } else {
        loginNavItem.style.display = "inline-block"; // Mostrar "Iniciar sesión"
        logoutNavItem.style.display = "none"; // Ocultar "Cerrar sesión"
        document.getElementById('user-info').style.display = 'none';
    }
}


function logoutUser() {
    fetch('/api/logout', {
        method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'Sesión cerrada exitosamente') {
            usuarioLogueado = false;
            userID = null;
            showCustomAlert('Sesión cerrada exitosamente');
            updateUIOnLogin();
            location.reload();
        } else {
           showCustomAlert('Error al cerrar sesión: ' + data.message,"error");
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function openProfileModal() {
    const modal = document.getElementById('perfilModal');
    modal.style.display = 'block';

    // Cargar datos del usuario
    const userId = localStorage.getItem('userId');
    if (userId) {
        fetchUserData(userId);
    }
}

function closeProfileModal() {
    const modal = document.getElementById('perfilModal');
    modal.style.display = 'none';
}


async function fetchUserData(userId) {
    const userDetailsResponse = await fetch(`/api/userDetails/${userId}`);
    if (!userDetailsResponse.ok) {
        console.error('Error al obtener los detalles del usuario');
        return;
    }
    const userDetails = await userDetailsResponse.json();
    
    // Actualizar los campos en la barra lateral
    document.getElementById('perfilNombre').textContent = userDetails.nombre || 'Nombre no disponible';
    document.getElementById('perfilApellido').textContent = userDetails.apellido || 'Apellido no disponible';

    // Actualizar los campos en el modal de perfil
    document.getElementById('perfilModalNombre').textContent = userDetails.nombre || 'Nombre no disponible';
    document.getElementById('perfilModalApellido').textContent = userDetails.apellido || 'Apellido no disponible';
    document.getElementById('perfilEmail').textContent = userDetails.email || 'Email no disponible';
    document.getElementById('perfilImg').src = userDetails.foto || '../imagenes/perfil.png'; // Ruta por defecto si no hay foto
}




function openEditProfileModal() {
    const modal = document.getElementById('editProfileModal');
    modal.style.display = 'flex';

    // Cargar datos del usuario
    const userId = localStorage.getItem('userId');
    if (userId) {
        fetchUserDataForEdit(userId);
    }
}

function closeEditProfileModal() {
    const modal = document.getElementById('editProfileModal');
    modal.style.display = 'none';
}

// Función para obtener los datos del usuario y cargarlos en el modal de edición
async function fetchUserDataForEdit(userId) {
    const userDetailsResponse = await fetch(`/api/userDetails/${userId}`);
    if (!userDetailsResponse.ok) {
        console.error('Error al obtener los detalles del usuario', "error");
        return;
    }
    const userDetails = await userDetailsResponse.json();

    // Prellenar los campos en el modal de edición de perfil
    document.getElementById('editName').value = userDetails.nombre || '';
    document.getElementById('editLastName').value = userDetails.apellido || '';
    document.getElementById('editPhone').value = userDetails.telefono || '';
    document.getElementById('editEmail').value = userDetails.email || '';
}

// Función para enviar los cambios del perfil a la API
document.getElementById('editProfileForm').addEventListener('submit', async function(event) {
    event.preventDefault(); // Prevenir que la página se recargue

    // Obtener el ID del usuario desde localStorage
    const userId = localStorage.getItem('userId');
    if (!userId) {
        console.error('No se encontró el ID del usuario');
        return;
    }

    // Obtener los valores editados de los campos
    const updatedName = document.getElementById('editName').value;
    const updatedLastName = document.getElementById('editLastName').value;
    const updatedPhone = document.getElementById('editPhone').value;
    const updatedEmail = document.getElementById('editEmail').value;

    try {
        // Hacer una solicitud PUT a la API para actualizar el perfil
        const response = await fetch(`/api/userDetails/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                nombre: updatedName,
                apellido: updatedLastName,
                telefono: updatedPhone,
                email: updatedEmail
            })
        });

        if (!response.ok) {
            throw new Error('Error al actualizar los datos del perfil');
        }

        const result = await response.json();
        console.log('Perfil actualizado:', result);

        // Cerrar el modal después de confirmar
        closeEditProfileModal();

        // Puedes mostrar un mensaje de éxito aquí si lo deseas
        showCustomAlert('Perfil actualizado exitosamente',"success");
    } catch (error) {
        console.error('Error al guardar los cambios del perfil:', error);
        showCustomAlert('Hubo un error al actualizar el perfil.');
    }
});




function obtenerTipoHabitacion(reservaId) {
    return fetch(`/api/habitacion/${reservaId}`)
        .then(response => response.json())
        .then(data => {
            return data.tipoHabitacion;
        })
        .catch(error => {
            console.error('Error al obtener tipo de habitación:', error);
            return 'Desconocido'; // Retornar un valor por defecto en caso de error
        });
}

function validatePhone(phone) {
    const phonePattern = /^[0-9]{9,}$/;
    return phonePattern.test(phone);
}

function registerUser(event) {
    event.preventDefault();

    const name = document.getElementById("registerName").value;
    const lastName = document.getElementById("registerLastName").value;
    const email = document.getElementById("registerEmail").value;
    const password = document.getElementById("registerPassword").value;
    const phone = document.getElementById("registerPhone").value; 


    if (!validatePhone(phone)) {
        showCustomAlert("El número de teléfono debe contener solo números y al menos 9 dígitos.", "error");
        return;
    }

    console.log("Datos del formulario:", { name, lastName, email, phone, password });

    fetch('/api/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nombre: name, apellido: lastName, correo_electronico: email, telefono: phone , contrasena: password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'Usuario registrado con éxito') {
            showCustomAlert('Registro exitoso. Ahora puedes iniciar sesión.');
            openLoginPage()
        } else {
            showCustomAlert('Error: ' + data.message, "error");
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showCustomAlert('Error al registrar usuario. Verifica los datos e intenta de nuevo.',"error");
    });
}

document.getElementById("registerForm").addEventListener("submit", registerUser);

 // Cerrar el modal al hacer clic fuera del contenido del modal
 window.addEventListener('click', (event) => {
    if (event.target === passportModal) {
        passportModal.style.display = 'none'; // Ocultar el modal
    }
});

// Función para mostrar/ocultar el sidebar
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('open');
}

// Función para cerrar el sidebar al hacer clic fuera de él
document.addEventListener('click', function(event) {
    const sidebar = document.getElementById('sidebar');
    const toggleButton = event.target.closest('li a[onclick="toggleSidebar()"]'); // Detectar si se hizo clic en el botón de tres rayas

    // Si se hace clic fuera del sidebar y no es el botón de apertura, cierra el sidebar
    if (!sidebar.contains(event.target) && !toggleButton && sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
    }
});



document.addEventListener('DOMContentLoaded', function () {
    // Llamar a la función para cargar habitaciones al iniciar
    fetchHabitaciones();
});

function fetchHabitaciones() {
    fetch('/api/habitaciones') // Verifica que este sea el endpoint adecuado
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                renderHabitaciones(data.habitaciones); // Asegúrate de limpiar antes de renderizar
            } else {
                console.error('Error al obtener habitaciones:', data.message);
            }
        })
        .catch(error => console.error('Error:', error));
}


function goToHabitacionPage(habitacionId) {
    window.location.href = `/pagHabitaciones/habitacion.html?id=${habitacionId}`; // Cambia esto a la URL correcta
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



document.addEventListener('DOMContentLoaded', function () {
    // Llamar a la función para cargar hoteles al iniciar
    fetchHoteles();
});

function fetchHoteles() {
    fetch('/api/hoteles') // Endpoint actualizado para obtener los hoteles
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                renderHoteles(data.hoteles);
            } else {
                console.error('Error al obtener hoteles:', data.message);
            }
        })
        .catch(error => console.error('Error:', error));
}

// Función para redirigir a la página de detalles del hotel
function goToHotelPage(id_hotel) {
    window.location.href = `/hotel/hotel.html?id=${id_hotel}`; // Cambia esto a la URL correcta
}

function renderHoteles(hoteles) {
    const roomListContainer = document.getElementById('roomListContainerHoteles'); // ID actualizado
    roomListContainer.innerHTML = ''; // Limpiar el contenedor

    // Seleccionar hoteles aleatorios
    const randomHotels = hoteles.sort(() => 0.5 - Math.random()).slice(0, 7);

    randomHotels.forEach(hotel => {
        // Asegúrate de que `hotel.foto` solo contenga el nombre del archivo de imagen
        const imageUrl = hotel.foto ? `http://localhost:3000/uploads/${hotel.foto}` : 'ruta/a/imagen-default.jpg';
        
        const div = document.createElement('div');
        div.className = 'card-item'; // Usar la clase general para las cartas
        div.onclick = () => goToHotelPage(hotel.id_hotel); // Hacer la tarjeta clickeable
        div.innerHTML = `
            <img src="${imageUrl}" alt="${hotel.nombre_hotel}" class="card-image">
            <div class="card-body">
                <h5>${hotel.nombre_hotel || 'Nombre no disponible'}</h5>
                <p>Dirección: ${hotel.direccion || 'No disponible'}</p>
                <p>Categoría: ${hotel.categoria || 'No disponible'}</p>
                <p>Calificación: ${hotel.calificacion_promedio || 'No disponible'}</p>
                <p>Número de Habitaciones: ${hotel.numero_habitaciones || 'No disponible'}</p>
            </div>
        `;
        roomListContainer.appendChild(div);
    });
}

function openReservasModal() {
    const userId = localStorage.getItem('userId');
    if (userId) {
        // Si el usuario está logueado, abrir el modal de reservas
        const modal = document.getElementById('reservasModal');
        modal.style.display = 'block';
        fetchReservas(); // Llama a la función para cargar las reservas del usuario en sesión
    } else {
        // Mostrar mensaje si no hay sesión activa
        showCustomAlert('Inicia sesión para ver tus reservas.', 'info');
    }
}






// Función para cerrar el modal de reservas
function closeReservasModal() {
    const modal = document.getElementById('reservasModal');
    modal.style.display = 'none';
}

// Función para formatear la fecha en dd/mm/aaaa
function formatearFecha(fechaISO) {
    const date = new Date(fechaISO);
    const dia = String(date.getDate()).padStart(2, '0'); // Día
    const mes = String(date.getMonth() + 1).padStart(2, '0'); // Mes (comienza en 0, por eso sumamos 1)
    const anio = date.getFullYear(); // Año
    return `${dia}/${mes}/${anio}`;
}

async function fetchReservas() {
    // Obtener el userId de localStorage o desde el servidor si no está disponible
    let userId = localStorage.getItem('userId');
    
    if (!userId) {
        const response = await fetch('/api/check-session');
        const sessionData = await response.json();
        if (sessionData.loggedIn) {
            userId = sessionData.userId;
            localStorage.setItem('userId', userId); // Guardar el userId en localStorage para futuras consultas
        } else {
            console.error('Usuario no autenticado');
            return;
        }
    }

    // Llamar al endpoint para obtener las reservas del usuario
    try {
        const response = await fetch(`/api/reservas/${userId}`);
        const data = await response.json();

        if (!data.success) {
            console.error(data.message || 'Error al obtener reservas');
            document.getElementById('reservasContainer').innerHTML = `<p>${data.message || 'No se encontraron reservas.'}</p>`;
            return;
        }

        // Renderizar las reservas en el modal
        renderReservas(data.reservas);
    } catch (error) {
        console.error('Error al obtener las reservas:', error);
    }
}

// Función para mostrar las reservas en el contenedor con el diseño del CSS
function renderReservas(reservas) {
    const reservasContainer = document.getElementById('reservasContainer');

    if (reservas.length === 0) {
        reservasContainer.innerHTML = '<p>No tienes reservas pendientes.</p>';
        return;
    }

    // Estructura HTML con clases aplicadas
    let reservasHTML = `
        <table id="reservasTable">
            <thead>
                <tr>
                    <th>Habitación</th>
                    <th>Fecha Entrada</th>
                    <th>Fecha Salida</th>
                    <th>Número de Personas</th>
                    <th>Precio Total</th>
                </tr>
            </thead>
            <tbody>`;

    reservas.forEach(reserva => {
        // Formatear el precio total con separador de miles y sin decimales
        const precioTotalFormateado = `$${parseFloat(reserva.precio_total).toLocaleString('es-ES', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        })} COP`;

        reservasHTML += `
            <tr>
                <td>${reserva.habitacion}</td>
                <td>${new Date(reserva.fechaEntrada).toLocaleDateString()}</td>
                <td>${new Date(reserva.fechaSalida).toLocaleDateString()}</td>
                <td>${reserva.numeroPersonas}</td>
                <td>${precioTotalFormateado}</td>
            </tr>
        `;
    });

    reservasHTML += `</tbody></table>`;
    reservasContainer.innerHTML = reservasHTML;
}




// Abrir el modal de pasaporte en la página de inicio de sesión
function openPassportModal() {
    const modal = document.getElementById("passportModal");
    modal.style.display = "flex";
    document.querySelector(".passport-content").classList.remove("open-register");
}

// Mostrar el formulario de registro y ocultar el de inicio de sesión
function openRegisterPage() {
    document.querySelector(".passport-content").classList.add("show-register");
}

// Volver al formulario de inicio de sesión y ocultar el de registro
function openLoginPage() {
    document.querySelector(".passport-content").classList.remove("show-register");
}


// Cerrar el modal de pasaporte
function closePassportModal() {
    const modal = document.getElementById("passportModal");
    modal.style.display = "none";
}





document.addEventListener('click', function(event) {
    const searchContainer = document.getElementById('buscador-seccion');
    const searchResults = document.getElementById('searchResultsContainer');
    const searchInput = document.getElementById('searchInput');

    // Verificar si el clic fue fuera del buscador y de los resultados
    if (!searchContainer.contains(event.target)) {
        searchResults.style.display = 'none'; // Ocultar los resultados
    }
});

// Mostrar el contenedor de resultados solo cuando se hace una búsqueda
function buscarHabitaciones() {
    const searchInput = document.getElementById('searchInput').value.trim();
    const searchResults = document.getElementById('searchResultsContainer');
    searchResults.style.display = 'block';

    if (!searchInput) {
        showCustomAlert("Por favor, ingresa una palabra clave para buscar.", "info");
        return;
    }

    fetch(`/api/buscar-habitaciones?query=${encodeURIComponent(searchInput)}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                renderSearchResults(data.habitaciones);
            } else {
                console.error("Error en la búsqueda:", data.message);
            }
        })
        .catch(error => console.error("Error al realizar la búsqueda:", error));
}

// Función para renderizar los resultados de búsqueda en el contenedor
function renderSearchResults(habitaciones) {
    const resultsContainer = document.getElementById('searchResultsContainer');
    resultsContainer.innerHTML = ''; // Limpiar resultados anteriores

    if (habitaciones.length === 0) {
        resultsContainer.innerHTML = '<p>No se encontraron habitaciones que coincidan con la búsqueda.</p>';
        return;
    }

    habitaciones.forEach(habitacion => {
        const div = document.createElement('div');
        div.className = 'search-result-item';
        div.onclick = () => goToHabitacionPage(habitacion.id_habitacion); // Redirige al hacer clic
        div.innerHTML = `
            <img src="http://localhost:3000/uploads/${habitacion.imagen_url || 'default-image.jpg'}" alt="${habitacion.nombre}">
            <h5>${habitacion.nombre}</h5>
            <p>Tipo: ${habitacion.tipo_habitacion}</p>
            <p>Descripción: ${habitacion.descripcion}</p>
            <p>Precio: ${habitacion.precio_por_noche}</p>
        `;
        resultsContainer.appendChild(div);
    });
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

function functionOne() {
    console.log("Función 1 activada");
    // Lógica de la función 1
}

function functionTwo() {
    console.log("Función 2 activada");
    // Lógica de la función 2
}


function toggleDarkMode() {
    const body = document.body;
    body.classList.toggle('dark-mode');
    const header = document.querySelector('header');
    const footer = document.querySelector('footer');

    header.classList.toggle('dark-mode');
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
    const header = document.querySelector('header');
    const footer = document.querySelector('footer');


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



const maxActiveTestimonials = 5; // Máximo de testimonios visibles al mismo tiempo
let activeTestimonials = 0; // Contador de testimonios activos en pantalla
const testimonialsContainer = document.querySelector(".testimonials-container");

// Función para cargar testimonios desde el archivo de texto
async function loadTestimonials() {
    const response = await fetch('../usuario/testimonials.txt');
    const data = await response.text();
    return data.split('\n').filter(line => line.trim() !== ""); // Filtra líneas vacías
}

// Función para crear y animar los testimonios de izquierda a derecha
function animateTestimonial(text) {
    // Crear un elemento para el testimonio
    const testimonial = document.createElement("div");
    testimonial.className = "testimonial";
    testimonial.textContent = text;

    // Configuración aleatoria para posición vertical y duración de la animación
    const randomY = Math.floor(Math.random() * (window.innerHeight / 2));
    const randomDuration = Math.floor(Math.random() * 20000) + 10000; // Duración entre 10s y 20s

    // Posición inicial y visibilidad del testimonio
    testimonial.style.top = `${randomY}px`;
    testimonial.style.left = '-200px'; // Comienza fuera del lado izquierdo
    testimonial.style.opacity = 1; // Mostrar el testimonio
    testimonialsContainer.appendChild(testimonial);

    // Aplicar movimiento de izquierda a derecha
    testimonial.animate(
        [
            { transform: `translateX(0)`, opacity: 1 },
            { transform: `translateX(${window.innerWidth + 200}px)`, opacity: 0 }
        ],
        {
            duration: randomDuration,
            easing: "linear",
            iterations: 1,
            fill: "forwards",
        }
    );

    // Eliminar el testimonio después de la animación y lanzar otro
    setTimeout(() => {
        testimonial.remove();
        activeTestimonials--; // Reducir el contador de testimonios activos
        triggerNextTestimonial(); // Iniciar otro testimonio
    }, randomDuration);
}

// Función para activar un nuevo testimonio si hay menos de 5 visibles
function triggerNextTestimonial() {
    if (activeTestimonials < maxActiveTestimonials) {
        const randomTestimonial = testimonials[Math.floor(Math.random() * testimonials.length)];
        activeTestimonials++; // Aumentar el contador de testimonios activos
        animateTestimonial(randomTestimonial);
    }
}

// Cargar y animar los testimonios
let testimonials = [];
loadTestimonials().then(data => {
    testimonials = data;
    testimonials.forEach(() => setTimeout(triggerNextTestimonial, Math.random() * 2000));
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



