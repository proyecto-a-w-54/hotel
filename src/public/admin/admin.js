document.getElementById("createAdminForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const createButton = document.querySelector('#createAdminButton');
    createButton.disabled = true; // Deshabilitar el botón para evitar múltiples clics

    try {
        const hotelFotoInput = document.getElementById("hotelFoto");
        const hotelFotoFile = hotelFotoInput && hotelFotoInput.files[0];

        const formData = new FormData();
        formData.append('nombre', document.getElementById("adminNombre").value);
        formData.append('apellido', document.getElementById("adminApellido").value);
        formData.append('telefono', document.getElementById("adminTelefono").value);
        formData.append('correo_electronico', document.getElementById("adminEmail").value);
        formData.append('contrasena', document.getElementById("adminPassword").value);
        formData.append('rol', 'administrador');
        formData.append('nombre_hotel', document.getElementById("hotelNombre").value);
        formData.append('descripcion', document.getElementById("hotelDescripcion").value);
        formData.append('direccion', document.getElementById("hotelDireccion").value);
        formData.append('categoria', document.getElementById("hotelCategoria").value);
        formData.append('numero_habitaciones', document.getElementById("hotelNumeroHabitaciones").value);
        formData.append('calificacion', document.getElementById("hotelCalificacion").value);

        // Agregar imagen si está disponible
        if (hotelFotoFile) {
            formData.append('foto', hotelFotoFile);
        }

        // Enviar la solicitud al servidor
        const response = await fetch('/api/create-admin', {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();

        if (response.ok && data.message === 'Administrador y hotel creados con éxito') {
            showCustomAlert('Administrador creado correctamente.', 'success');
            document.getElementById('addAdminModal').style.display = 'none'; // Cerrar el modal
            loadAdminList(); // Recargar la lista de administradores
        } else {
            throw new Error(data.message || 'Error desconocido');
        }
    } catch (error) {
        console.error('Error:', error);
        showCustomAlert(`Error al crear el administrador: ${error.message}`, 'error');
    } finally {
        createButton.disabled = false; // Habilitar el botón
    }
});


// Función de vista previa de imagen
function previewImage(inputId, previewId) {
    const fileInput = document.getElementById(inputId);
    const preview = document.getElementById(previewId);

    if (fileInput && fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            preview.style.backgroundImage = `url(${e.target.result})`;
            preview.textContent = ''; // Eliminar el texto predeterminado
        };
        reader.readAsDataURL(fileInput.files[0]);
    } else {
        preview.style.backgroundImage = 'none';
        preview.textContent = 'Sin imagen seleccionada';
    }
}


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
            document.getElementById("editHotelCalificacion").value = data.calificacion;

            // Vista previa de la imagen
            const editImagePreview = document.getElementById('editImagePreview');
            if (data.imagen_hotel) {
                editImagePreview.style.backgroundImage = `url(http://localhost:3000/uploads/${data.imagen_hotel})`;
                editImagePreview.textContent = ''; 
            } else {
                editImagePreview.style.backgroundImage = 'none';
                editImagePreview.textContent = 'Sin imagen disponible';
            }

            // Mostrar el modal
            openModal(modals.editAdmin);
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


function previewImage(inputId, previewId) {
    const file = document.getElementById(inputId).files[0];
    const preview = document.getElementById(previewId);

    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            preview.style.backgroundImage = `url(${e.target.result})`;
            preview.textContent = ''; // Elimina el texto "Haz clic para subir una imagen"
        };
        reader.readAsDataURL(file);
    }
}

function cargarImagenAdmin(idAdmin) {
    // Simula una llamada para obtener los datos del administrador, incluyendo la imagen
    fetch(`/api/admin/${idAdmin}`)
        .then(response => response.json())
        .then(adminData => {
            if (adminData.imagen) {
                // Establecer la imagen actual como fondo del contenedor de vista previa
                const preview = document.getElementById('editImagePreview');
                preview.style.backgroundImage = `url(${adminData.imagen})`; // URL de la imagen desde el servidor
                preview.textContent = ''; // Elimina el texto predeterminado
            }
        })
        .catch(error => {
            console.error('Error al cargar los datos del administrador:', error);
        });
}



// Evento para el botón de editar
document.getElementById("editAdminButton").addEventListener("click", () => {
    const selectedCheckbox = document.querySelector('#adminList input[type="checkbox"]:checked');
    if (!selectedCheckbox) {
        showCustomAlert('Por favor, seleccione un administrador para editar.',"info");
        return;
    }
    const adminId = selectedCheckbox.id.split('-')[1];
    getAdminData(adminId);
});

document.getElementById("saveAdminChangesButton").addEventListener("click", () => {
    const formData = new FormData();

    formData.append('id_usuario', document.getElementById("editAdminId").value);
    formData.append('nombre', document.getElementById("editAdminNombre").value);
    formData.append('apellido', document.getElementById("editAdminApellido").value);
    formData.append('telefono', document.getElementById("editAdminTelefono").value);
    formData.append('correo_electronico', document.getElementById("editAdminEmail").value);
    formData.append('nombre_hotel', document.getElementById("editHotelNombre").value);
    formData.append('descripcion', document.getElementById("editHotelDescripcion").value);
    formData.append('direccion', document.getElementById("editHotelDireccion").value);
    formData.append('categoria', document.getElementById("editHotelCategoria").value);
    formData.append('numero_habitaciones', document.getElementById("editHotelNumeroHabitaciones").value);
    formData.append('calificacion', document.getElementById("editHotelCalificacion").value);

    const fotoInput = document.getElementById('editHotelFoto');
    if (fotoInput && fotoInput.files[0]) {
        formData.append('foto', fotoInput.files[0]);
    }

    fetch('/api/edit-admin', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                showCustomAlert(data.message, "success");
                loadAdminList(); // Actualizar la lista
                closeModal(modals.editAdmin);
            } else {
                showCustomAlert("Error al guardar cambios.", "error");
            }
        })
        .catch(error => console.error('Error al guardar los cambios:', error));
});



// Evento de clic en el botón de editar
document.getElementById("editAdminButton").addEventListener("click", function() {
    const selectedCheckbox = Array.from(document.querySelectorAll('#adminList input[type="checkbox"]')).find(cb => cb.checked);
    
    if (!selectedCheckbox) {
        showCustomAlert('Por favor, seleccione un administrador para editar.',"info"); // Alerta si no hay un administrador seleccionado
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
                showCustomAlert('Error al cerrar sesión: ' + data.message,"error");
            }
        })
        .catch(error => console.error('Error:', error));
}

function deleteAdmin() {
    const selectedCheckbox = document.querySelector('#adminList input[type="checkbox"]:checked');
    if (!selectedCheckbox) {
        showCustomAlert('Por favor, selecciona un administrador para eliminar.', 'info');
        return;
    }

    const adminId = selectedCheckbox.id.split('-')[1];

    // Mostrar el modal de confirmación
    const confirmDeleteModal = document.getElementById('confirmDeleteModal');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');

    confirmDeleteModal.style.display = 'flex';

    // Limpia los eventos previos
    confirmDeleteBtn.onclick = null;
    cancelDeleteBtn.onclick = null;

    // Si el usuario confirma
    confirmDeleteBtn.onclick = function () {
        fetch(`/api/delete-admin/${adminId}`, { method: 'DELETE' })
            .then(response => response.json())
            .then(data => {
                confirmDeleteModal.style.display = 'none'; // Cierra el modal
                if (data.success) {
                    showCustomAlert(data.message || 'Administrador eliminado correctamente.', 'success');
                    loadAdminList(); // Recarga la lista de administradores
                } else {
                    showCustomAlert('Hubo un problema al eliminar el administrador.', 'error');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                confirmDeleteModal.style.display = 'none'; // Cierra el modal
                showCustomAlert('Error al intentar eliminar el administrador.', 'error');
            });
    };

    // Si el usuario cancela
    cancelDeleteBtn.onclick = function () {
        confirmDeleteModal.style.display = 'none';
    };
}

// Agregar el evento al botón de eliminar
document.getElementById("deleteAdminButton").addEventListener("click", deleteAdmin);


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