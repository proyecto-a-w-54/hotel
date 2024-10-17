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
    const numero_personas=document.getElementById("hotelNumeroHabitaciones").value;
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
// Cargar la lista de administradores al cargar la página
document.addEventListener("DOMContentLoaded", loadAdminList);

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


function loadAdminList() {
    fetch('/api/list-admins')
        .then(response => response.json())
        .then(data => {
            const adminList = document.getElementById("adminList");
            adminList.innerHTML = ''; // Limpiar la lista
            data.admins.forEach(admin => {
                const li = document.createElement("li");
                li.textContent = `Nombre: ${admin.nombre} ${admin.apellido}, Teléfono: ${admin.telefono}, Correo: ${admin.correo_electronico}, Número de habitaciones: ${admin.numero_habitaciones}`;
                adminList.appendChild(li);
            });
        })
        .catch(error => {
            console.error('Error al cargar los administradores:', error);
        });
}

// Cargar la lista de administradores al cargar la página
document.addEventListener("DOMContentLoaded", loadAdminList);


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

const stars = document.querySelectorAll('.star');
const calificacionInput = document.getElementById('hotelCalificacion');

stars.forEach(star => {
    star.addEventListener('click', () => {
        const value = star.getAttribute('data-value');
        calificacionInput.value = value;

        // Limpiar todas las estrellas antes de agregar la selección
        stars.forEach(s => s.classList.remove('selected'));

        // Marcar las estrellas hasta la seleccionada
        for (let i = 0; i < value; i++) {
            stars[i].classList.add('selected');
        }
    });
});

    // Obtiene los elementos del DOM
    const addAdminModal = document.getElementById('addAdminModal');
    const addAdminButton = document.getElementById('addAdminButton');
    const closeAddAdminModal = document.getElementById('closeAddAdminModal');

    // Función para abrir el modal
    function openModal() {
        addAdminModal.style.display = 'block'; // Muestra el modal
    }

    // Función para cerrar el modal
    function closeModal() {
        addAdminModal.style.display = 'none'; // Oculta el modal
    }

    // Agrega evento de clic al botón para abrir el modal
    addAdminButton.addEventListener('click', openModal);

    // Agrega evento de clic a la "X" para cerrar el modal
    closeAddAdminModal.addEventListener('click', closeModal);

    // Agrega evento de clic fuera del modal para cerrarlo
    window.addEventListener('click', function(event) {
        if (event.target === addAdminModal) {
            closeModal();
        }
    });
    const editAdminModal = document.getElementById('editAdminModal');
    const closeEditAdminModal = document.getElementById('closeEditAdminModal');

    // Función para abrir el modal de editar administrador
    function openEditModal() {
        editAdminModal.style.display = 'block'; // Muestra el modal
    }

    // Función para cerrar el modal de editar administrador
    function closeEditModal() {
        editAdminModal.style.display = 'none'; // Oculta el modal
    }

    // Agrega evento de clic a la "X" para cerrar el modal de editar administrador
    closeEditAdminModal.addEventListener('click', closeEditModal);

    // Agrega evento de clic fuera del modal para cerrarlo
    window.addEventListener('click', function(event) {
        if (event.target === editAdminModal) {
            closeEditModal();
        }
    });

    // Obtiene los elementos del DOM para el modal de confirmación de eliminación
    const confirmDeleteModal = document.getElementById('confirmDeleteModal');
    const closeDeleteModal = document.getElementById('closeDeleteModal');

    // Función para abrir el modal de confirmación de eliminación
    function openDeleteModal() {
        confirmDeleteModal.style.display = 'block'; // Muestra el modal
    }

    // Función para cerrar el modal de confirmación de eliminación
    function closeDeleteModalFunction() {
        confirmDeleteModal.style.display = 'none'; // Oculta el modal
    }

    // Agrega evento de clic a la "X" para cerrar el modal de confirmación de eliminación
    closeDeleteModal.addEventListener('click', closeDeleteModalFunction);

    // Agrega evento de clic fuera del modal para cerrarlo
    window.addEventListener('click', function(event) {
        if (event.target === confirmDeleteModal) {
            closeDeleteModalFunction();
        }
    });