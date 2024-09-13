document.getElementById("createAdminForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const nombre = document.getElementById("adminNombre").value;
    const apellido = document.getElementById("adminApellido").value;
    const correo_electronico = document.getElementById("adminEmail").value;
    const contrasena = document.getElementById("adminPassword").value;
    const rol = 'administrador';

    const nombre_hotel = document.getElementById("hotelNombre").value;
    const descripcion = document.getElementById("hotelDescripcion").value;
    const direccion = document.getElementById("hotelDireccion").value;
    const categoria = document.getElementById("hotelCategoria").value;

    fetch('/api/create-admin', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            nombre,
            apellido,
            correo_electronico,
            contrasena,
            rol,
            nombre_hotel,
            descripcion,
            direccion,
            categoria
        })
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
