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
        foto: document.getElementById("hotelFoto").files[0]
    };

    const formData = new FormData();
    Object.entries(adminData).forEach(([key, value]) => {
        formData.append(key, value);
    });

    fetch('/api/create-admin', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message === 'Administrador y hotel creados con éxito' ? 'Administrador y hotel creados correctamente.' : 'Error al crear administrador: ' + data.message);
        if (data.message === 'Administrador y hotel creados con éxito') loadAdminList();
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

                // Crear un checkbox
                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.id = `admin-${admin.id_usuario}`; // Asignar un ID único basado en el ID del administrador

                // Agregar evento de cambio para permitir solo un checkbox seleccionado
                checkbox.addEventListener('change', function() {
                    adminList.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
                        if (cb !== checkbox) cb.checked = false; // Desmarcar otros checkboxes
                    });
                    toggleEditButton(); // Verificar si habilitar o deshabilitar el botón de editar
                });

                // Crear una etiqueta para el checkbox
                const label = document.createElement("label");
                label.htmlFor = checkbox.id; // Asociar la etiqueta con el checkbox
                label.textContent = `Nombre: ${admin.nombre} ${admin.apellido}, Teléfono: ${admin.telefono}, Correo: ${admin.correo_electronico}, Número de habitaciones: ${admin.numero_habitaciones}`;

                // Agregar el checkbox y la etiqueta al elemento li
                li.appendChild(checkbox);
                li.appendChild(label);
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

function getAdminData(adminId) {
    fetch(`/api/get-admin/${adminId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al obtener los datos del administrador');
            }
            return response.json();
        })
        .then(data => {
            // Llenar los campos del formulario de edición con los datos del administrador
            document.getElementById("editAdminId").value = adminId; // Asignar el ID del administrador
            document.getElementById("editAdminNombre").value = data.nombre;
            document.getElementById("editAdminApellido").value = data.apellido;
            document.getElementById("editAdminTelefono").value = data.telefono;
            document.getElementById("editAdminEmail").value = data.correo_electronico;
            document.getElementById("editHotelNombre").value = data.nombre_hotel;
            document.getElementById("editHotelDescripcion").value = data.descripcion;
            document.getElementById("editHotelDireccion").value = data.direccion;
            document.getElementById("editHotelCategoria").value = data.categoria;
            document.getElementById("editHotelNumeroHabitaciones").value = data.numero_habitaciones;
            document.getElementById("editHotelCalificacion").value = data.calificacion;

            // Mostrar el modal de edición
            document.getElementById("editAdminModal").style.display = 'block';
        })
        .catch(error => {
            console.error('Error al obtener los datos del administrador:', error);
        });
}


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

function saveAdminChanges() {
    const id_usuario = document.getElementById("editAdminId").value; // Obteniendo el ID del administrador
    const nombre = document.getElementById("editAdminNombre").value;
    const apellido = document.getElementById("editAdminApellido").value;
    const telefono = document.getElementById("editAdminTelefono").value;
    const correo_electronico = document.getElementById("editAdminEmail").value;
    const nombre_hotel = document.getElementById("editHotelNombre").value;
    const descripcion = document.getElementById("editHotelDescripcion").value;
    const direccion = document.getElementById("editHotelDireccion").value;
    const categoria = document.getElementById("editHotelCategoria").value;
    const numero_habitaciones = document.getElementById("editHotelNumeroHabitaciones").value;
    const calificacion = document.getElementById("editHotelCalificacion").value;

    fetch('/api/edit-admin', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id_usuario,
            nombre,
            apellido,
            telefono,
            correo_electronico,
            nombre_hotel,
            descripcion,
            direccion,
            categoria,
            numero_habitaciones,
            calificacion
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error al guardar los cambios');
        }
        return response.json();
    })
    .then(data => {
        alert(data.message || 'Cambios guardados correctamente');
        closeModal(modals.editAdmin); // Cerrar el modal después de guardar
        loadAdminList(); // Recargar la lista de administradores
    })
    .catch(error => {
        console.error('Error:', error);
    });
}


// Evento para el botón de guardar cambios
document.getElementById("saveAdminChangesButton").addEventListener("click", saveAdminChanges);


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


// Seleccionar las estrellas y el campo oculto de calificación
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
