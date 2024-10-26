// Función para manejar el envío del formulario de creación de administrador
document.getElementById("createAdminForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const adminData = {
        nombre: document.getElementById("adminNombre").value,
        apellido: document.getElementById("adminApellido").value,
        telefono: document.getElementById("adminTelefono").value,
        correo_electronico: document.getElementById("adminEmail").value,
        contrasena: document.getElementById("adminPassword").value,
        rol: 'administrador',
        nombre_hotel: document.getElementById("hotelNombre").value,
        descripcion: document.getElementById("hotelDescripcion").value,
        direccion: document.getElementById("hotelDireccion").value,
        categoria: document.getElementById("hotelCategoria").value,
        numero_habitaciones: document.getElementById("hotelNumeroHabitaciones").value,
        calificacion: document.getElementById("hotelCalificacion").value, // <== Asegúrate de incluirlo
        foto: document.getElementById("hotelFoto").files[0]
    };  

   // Convertir los datos en un FormData para enviar con imagen
    const formData = new FormData();
    Object.entries(adminData).forEach(([key, value]) => {
        formData.append(key, value);
    });

    // Realizar el envío al backend
    fetch('/api/create-admin', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'Administrador y hotel creados con éxito') {
            alert('Administrador creado correctamente.');
            loadAdminList(); // Recargar la lista de administradores
        } else {
            alert('Error al crear administrador: ' + data.message);
        }
    })
    .catch(error => console.error('Error:', error));
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
                li.className = "admin-item"; // Añadir clase para estilos específicos

                // Crear la estructura del administrador
                const adminInfoDiv = document.createElement("div");
                adminInfoDiv.className = "admin-info";
                
                // Añadir el nombre, teléfono y correo
                adminInfoDiv.innerHTML = `
                    <h3>${admin.nombre} ${admin.apellido}</h3>
                    <p>${admin.telefono}</p>
                    <p>${admin.correo_electronico}</p>
                `;

                // Crear la estructura para el número de habitaciones
                const hotelInfoDiv = document.createElement("div");
                hotelInfoDiv.className = "hotel-info";
                hotelInfoDiv.innerHTML = `
                    <p>Número de habitaciones: ${admin.numero_habitaciones}</p>
                `;

                // Crear el checkbox
                const adminActionsDiv = document.createElement("div");
                adminActionsDiv.className = "admin-actions";
                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.id = `admin-${admin.id_usuario}`; // Asignar un ID único basado en el ID del administrador
                adminActionsDiv.appendChild(checkbox);

                // Añadir el evento de cambio para el checkbox
                checkbox.addEventListener('change', function() {
                    adminList.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
                        if (cb !== checkbox) cb.checked = false; // Desmarcar otros checkboxes
                    });
                    toggleEditButton(); // Verificar si habilitar o deshabilitar el botón de editar
                });

                // Agregar los elementos al li
                li.appendChild(adminInfoDiv);
                li.appendChild(hotelInfoDiv);
                li.appendChild(adminActionsDiv);

                // Agregar el li a la lista
                adminList.appendChild(li);
            });
        })
        .catch(error => console.error('Error al cargar los administradores:', error));
}


// Cargar la lista de administradores al cargar la página
document.addEventListener("DOMContentLoaded", () => {
    loadAdminList();
    toggleEditButton(); // Asegúrate de que el botón esté en el estado correcto al cargar la lista
});

// Función para habilitar o deshabilitar el botón de editar
function toggleEditButton() {
    const checkboxes = document.querySelectorAll('#adminList input[type="checkbox"]');
    const editButton = document.getElementById("editAdminButton");
    editButton.disabled = !Array.from(checkboxes).some(cb => cb.checked);
}

// Verificación de la sesión activa
document.addEventListener("DOMContentLoaded", function() {
    if (!localStorage.getItem('userId')) {
        window.location.href = '/login.html'; // Redirigir si no hay sesión
    }
});

// Función para mostrar la calificación en estrellas cuando se carga el modal de edición
function showCalificacion(calificacion) {
    const stars = document.querySelectorAll('#editAdminModal .star');
    stars.forEach(star => star.classList.remove('selected')); // Limpia las estrellas seleccionadas

    // Marca las estrellas según el valor de calificación
    for (let i = 0; i < calificacion; i++) {
        stars[i].classList.add('selected');
    }
    document.getElementById("editHotelCalificacion").value = calificacion;
}


// Al obtener los datos del administrador, incluye la calificación
function getAdminData(adminId) {
    fetch(`/api/get-admin/${adminId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al obtener los datos del administrador');
            }
            return response.json();
        })
        .then(data => {
            document.getElementById("editAdminId").value = adminId;
            document.getElementById("editAdminNombre").value = data.nombre;
            document.getElementById("editAdminApellido").value = data.apellido;
            document.getElementById("editAdminTelefono").value = data.telefono;
            document.getElementById("editAdminEmail").value = data.correo_electronico;
            document.getElementById("editHotelNombre").value = data.nombre_hotel;
            document.getElementById("editHotelDescripcion").value = data.descripcion;
            document.getElementById("editHotelDireccion").value = data.direccion;
            document.getElementById("editHotelCategoria").value = data.categoria;
            document.getElementById("editHotelNumeroHabitaciones").value = data.numero_habitaciones;
            showCalificacion(data.calificacion); // Muestra la calificación en estrellas
            document.getElementById("editAdminModal").style.display = 'block';
        })
        .catch(error => {
            console.error('Error al obtener los datos del administrador:', error);
        });
}

// Lógica para mostrar y seleccionar calificación con hover en el modal de edición
const editStars = document.querySelectorAll('#editAdminModal .star');
const editCalificacionInput = document.getElementById("editHotelCalificacion");

editStars.forEach(star => {
    // Evento para mostrar la calificación temporalmente al hacer hover
    star.addEventListener('mouseover', () => {
        const value = star.getAttribute('data-value');
        editStars.forEach(s => s.classList.remove('hovered'));
        for (let i = 0; i < value; i++) {
            editStars[i].classList.add('hovered');
        }
    });

    // Evento para remover el efecto hover cuando se sale de las estrellas
    star.addEventListener('mouseout', () => {
        editStars.forEach(s => s.classList.remove('hovered'));
    });

    // Evento para seleccionar y fijar la calificación al hacer clic
    star.addEventListener('click', () => {
        const value = star.getAttribute('data-value');
        editCalificacionInput.value = value;

        // Marcar las estrellas seleccionadas y fijarlas
        editStars.forEach(s => s.classList.remove('selected', 'hovered')); // Elimina ambas clases
        for (let i = 0; i < value; i++) {
            editStars[i].classList.add('selected');
        }
    });
});




// Evento para el botón de editar
document.getElementById("editAdminButton").addEventListener("click", () => {
    const selectedCheckbox = document.querySelector('#adminList input[type="checkbox"]:checked');
    if (!selectedCheckbox) {
        alert('Por favor, seleccione un administrador para editar.');
        return;
    }
    const adminId = selectedCheckbox.id.split('-')[1];
    getAdminData(adminId);
});

// Evento para guardar cambios al hacer clic en el botón de guardar
document.getElementById("saveAdminChangesButton").addEventListener("click", () => {
    const id_usuario = document.getElementById("editAdminId").value;
    const adminData = {
        id_usuario,
        nombre: document.getElementById("editAdminNombre").value,
        apellido: document.getElementById("editAdminApellido").value,
        telefono: document.getElementById("editAdminTelefono").value,
        correo_electronico: document.getElementById("editAdminEmail").value,
        nombre_hotel: document.getElementById("editHotelNombre").value,
        descripcion: document.getElementById("editHotelDescripcion").value,
        direccion: document.getElementById("editHotelDireccion").value,
        categoria: document.getElementById("editHotelCategoria").value,
        numero_habitaciones: document.getElementById("editHotelNumeroHabitaciones").value,
        calificacion: document.getElementById("editHotelCalificacion").value,
    };

    fetch('/api/edit-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adminData)
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message || 'Cambios guardados correctamente');
        closeModal(modals.editAdmin); 
        loadAdminList();
    })
    .catch(error => console.error('Error al guardar los cambios:', error));
});


// Evento de clic en el botón de editar
document.getElementById("editAdminButton").addEventListener("click", function() {
    const selectedCheckbox = Array.from(document.querySelectorAll('#adminList input[type="checkbox"]')).find(cb => cb.checked);
    
    if (!selectedCheckbox) {
        alert('Por favor, seleccione un administrador para editar.'); // Alerta si no hay un administrador seleccionado
    } else {
        const adminId = selectedCheckbox.id.split('-')[1]; // Extraer el ID del administrador
        getAdminData(adminId); // Carga los datos del administrador seleccionado
    }
});


// Función para cerrar sesión
function logoutUser() {
    fetch('/api/logout', { method: 'POST' })
        .then(response => response.json())
        .then(data => {
            if (data.message === 'Sesión cerrada exitosamente') {
                console.log('Sesión cerrada exitosamente');
                window.location.href = '/usuario/index.html';
            } else {
                alert('Error al cerrar sesión: ' + data.message);
            }
        })
        .catch(error => console.error('Error:', error));
}

function deleteAdmin() {
    const selectedCheckbox = document.querySelector('#adminList input[type="checkbox"]:checked');
    if (!selectedCheckbox) {
        alert('Por favor, selecciona un administrador para eliminar.');
        return;
    }
    const adminId = selectedCheckbox.id.split('-')[1];

    if (confirm("¿Estás seguro de que deseas eliminar este administrador y todos los datos asociados? Esta acción no se puede deshacer.")) {
        fetch(`/api/delete-admin/${adminId}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al eliminar el administrador');
            }
            return response.json();
        })
        .then(data => {
            alert(data.message || 'Administrador eliminado correctamente');
            loadAdminList(); // Recargar la lista de administradores
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }
}

// Agregar el evento al botón de eliminar
document.getElementById("deleteAdminButton").addEventListener("click", deleteAdmin);


const stars = document.querySelectorAll('.star');
const calificacionInput = document.getElementById('hotelCalificacion');

stars.forEach(star => {
    star.addEventListener('click', () => {
        const value = star.getAttribute('data-value');
        calificacionInput.value = value;

        // Marcar todas las estrellas hasta la seleccionada
        stars.forEach(s => s.classList.remove('selected'));
        for (let i = 0; i < value; i++) {
            stars[i].classList.add('selected');
        }
    });
});


// Funciones para manejar modales (ya definidas en el código anterior)
const modals = {
    addAdmin: document.getElementById('addAdminModal'),
    editAdmin: document.getElementById('editAdminModal'),

};

const buttons = {
    addAdmin: document.getElementById('addAdminButton'),
    editAdmin: document.getElementById('editAdminButton'),
};

const closeButtons = {
    addAdmin: document.getElementById('closeAddAdminModal'),
    editAdmin: document.getElementById('closeEditAdminModal'),
};

// Función para abrir un modal
function openModal(modal) {
    modal.style.display = 'block';
}

// Función para cerrar un modal
function closeModal(modal) {
    modal.style.display = 'none';
}

// Agrega eventos a los botones de abrir modales
buttons.addAdmin.addEventListener('click', () => openModal(modals.addAdmin));
buttons.editAdmin.addEventListener('click', () => openModal(modals.editAdmin));

// Agrega eventos a los botones de cerrar modales
closeButtons.addAdmin.addEventListener('click', () => closeModal(modals.addAdmin));
closeButtons.editAdmin.addEventListener('click', () => closeModal(modals.editAdmin));


// Agrega eventos para cerrar modales al hacer clic fuera de ellos
window.addEventListener('click', function (event) {
    for (const modalKey in modals) {
        if (event.target === modals[modalKey]) {
            closeModal(modals[modalKey]);
        }
    }
});
