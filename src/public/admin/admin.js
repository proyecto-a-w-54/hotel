document.getElementById("createAdminForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const nombre = document.getElementById("adminNombre").value;
    const apellido = document.getElementById("adminApellido").value;
    const telefono = document.getElementById("adminTelefono").value;
    const correo_electronico = document.getElementById("adminEmail").value;
    const contrasena = document.getElementById("adminPassword").value;
    const rol = 'administrador';

    const nombre_hotel = document.getElementById("hotelNombre").value;
    const descripcion = document.getElementById("hotelDescripcion").value;
    const direccion = document.getElementById("hotelDireccion").value;
    const categoria = document.getElementById("hotelCategoria").value;
    const calificacion=document.getElementById("hotelCalificacion").value;
    const numero_personas=document.getElementById("hotelNumeroHabitaciones").values;
    const foto = document.getElementById("hotelFoto").files[0];

    const formData = new FormData();
    formData.append("nombre", nombre);
    formData.append("apellido", apellido);
    formData.append("telefono", telefono);
    formData.append("correo_electronico", correo_electronico);
    formData.append("contrasena", contrasena);
    formData.append("rol", rol);
    formData.append("nombre_hotel", nombre_hotel);
    formData.append("descripcion", descripcion);
    formData.append("direccion", direccion);
    formData.append("categoria", categoria);
    formData.append("calificacion",calificacion);
    formData.append("numero_personas", numero_personas);
    formData.append("foto", foto);

    fetch('/api/create-admin', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'Administrador y hotel creados con éxito') {
            alert('Administrador y hotel creados correctamente.');
            loadAdminList();
        } else {
            alert('Error al crear administrador: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
});

// Función para cargar la lista de administradores
function loadAdminList() {
    fetch('/api/list-admins')
        .then(response => response.json())
        .then(data => {
            const adminList = document.getElementById("adminList");
            adminList.innerHTML = ''; // Limpiar la lista
            data.admins.forEach(admin => {
                const li = document.createElement("li");
                li.textContent = `${admin.nombre} ${admin.apellido} (${admin.correo_electronico})`;
                adminList.appendChild(li);
            });
        })
        .catch(error => {
            console.error('Error al cargar los administradores:', error);
        });
}

// Cargar la lista de administradores al cargar la página
document.addEventListener("DOMContentLoaded", loadAdminList);

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

// Verificación de la sesión activa
document.addEventListener("DOMContentLoaded", function() {
    const userId = localStorage.getItem('userId');
    
    if (!userId) {
        window.location.href = '/login.html'; // Redirigir si no hay sesión
    }
});
function logoutUser() {
    fetch('/api/logout', {
        method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'Sesión cerrada exitosamente') {
            console.log('Sesión cerrada exitosamente');
            // Redirigir a index.html
            window.location.href = '/usuario/index.html';
        } else {
            alert('Error al cerrar sesión: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}
// Obtener el modal
var modal = document.getElementById("myModal");

// Obtener el botón que abre el modal
var btn = document.getElementById("openModalButton");

// Obtener el elemento <span> que cierra el modal
var span = document.getElementById("closeModalButton");

// Cuando el usuario hace clic en el botón, abre el modal 
btn.onclick = function() {
    modal.style.display = "block";
}

// Cuando el usuario hace clic en <span> (x), cierra el modal
span.onclick = function() {
    modal.style.display = "none";
}

// Cuando el usuario hace clic en cualquier lugar fuera del modal, cierra el modal
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

// Seleccionar las estrellas y el campo oculto de calificación
const stars = document.querySelectorAll('.star');
const calificacionInput = document.getElementById('hotelCalificacion');

// Función para manejar el clic en las estrellas
stars.forEach(star => {
    star.addEventListener('click', () => {
        // Obtener el valor de la estrella seleccionada
        const value = star.getAttribute('data-value');

        // Establecer el valor en el campo oculto
        calificacionInput.value = value;

        // Limpiar la selección de estrellas
        stars.forEach(s => s.classList.remove('selected'));

        // Seleccionar las estrellas hasta la que se hizo clic
        for (let i = 0; i < value; i++) {
            stars[i].classList.add('selected');
        }
    });
});
