document.addEventListener('DOMContentLoaded', function () {
    // Obtener el nombre del usuario al cargar la página
    fetch('/api/username')
        .then(response => response.json())
        .then(data => {
            if (data.username) {
                setUsername(data.username);
            } else {
                console.error(data.message);
            }
        })
        .catch(error => console.error('Error:', error));
});

function setUsername(username) {
    const usernameDisplay = document.getElementById('usernameDisplay');
    if (usernameDisplay) {
        usernameDisplay.textContent = username; // Actualizar el texto con el nombre del usuario
    }
}

document.addEventListener('DOMContentLoaded', function () {
    // Obtener elementos del DOM
    const addRoomForm = document.getElementById('addRoomForm');
    const addRoomButton = document.getElementById('addRoomButton');
    const addRoomModal = document.getElementById('addRoomModal');
    const closeAddRoomModalButton = document.querySelector('#addRoomModal .close');
    const editButton = document.getElementById('editButton');
    const deleteButton = document.getElementById('deleteButton');
    const saveRoomButton = document.getElementById('saveRoomButton');

    // Event listener para abrir el modal de agregar habitación
    addRoomButton.addEventListener('click', openAddRoomModal);

    // Event listener para cerrar el modal de agregar habitación
    closeAddRoomModalButton.addEventListener('click', closeAddRoomModal);

    // Cerrar modal al hacer clic fuera del contenido del modal
    window.addEventListener('click', function (event) {
        if (event.target === addRoomModal) {
            closeAddRoomModal();
        }
    });

    // Event listener para el formulario de agregar habitación
    addRoomForm.addEventListener('submit', function (event) {
        event.preventDefault(); // Evitar refrescar la página
        addHabitacion();
    });


    // Event listener para abrir el modal de confirmación de eliminación
    deleteButton.addEventListener('click', function () {
        const selectedRoom = getSelectedRoomId();
        if (selectedRoom) {
            openConfirmDeleteModal(selectedRoom);
        } else {
            alert('Por favor, selecciona una habitación para eliminar.');
        }
    });
        // Event listener para el formulario de confirmación de eliminación
        confirmDeleteForm.addEventListener('submit', function (event) {
            event.preventDefault(); // Evitar refrescar la página
            deleteHabitacion();
        });
});

document.addEventListener('DOMContentLoaded', function () {
    // Botón de editar
    const editButton = document.getElementById('editButton');
    
    // Event listener para el botón de editar
    editButton.addEventListener('click', function () {
        const selectedRoom = getSelectedRoomId(); // Obtener la habitación seleccionada
        if (selectedRoom) {
            openEditRoomModal(selectedRoom); // Abrir el modal de edición con la habitación seleccionada
        } else {
            alert('Por favor, selecciona una habitación para editar.');
        }
    });
});

// Función para obtener la habitación seleccionada por el checkbox
function getSelectedRoomId() {
    const checkboxes = document.querySelectorAll('.room-checkbox');
    let selectedRoomId = null;

    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            selectedRoomId = checkbox.getAttribute('data-id');
        }
    });

    return selectedRoomId;
}


// Función para abrir el modal de confirmación de eliminación
function openConfirmDeleteModal(roomId) {
    const confirmDeleteModal = document.getElementById('confirmDeleteModal');
    confirmDeleteModal.style.display = 'block';
    // Puedes guardar el id de la habitación a eliminar en el modal si lo necesitas
    confirmDeleteModal.dataset.roomId = roomId;
}

// Función para cerrar el modal de confirmación de eliminación
function closeConfirmDeleteModal() {
    const confirmDeleteModal = document.getElementById('confirmDeleteModal');
    confirmDeleteModal.style.display = 'none';
}

// Función para eliminar una habitación
function deleteHabitacion() {
    const confirmDeleteModal = document.getElementById('confirmDeleteModal');
    const roomId = confirmDeleteModal.dataset.roomId;
    const password = document.getElementById('confirmPassword').value;

    if (password) {
        // Realizar la solicitud DELETE al servidor
        fetch(`/api/habitaciones/${roomId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ password: password }) // Si necesitas enviar la contraseña
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log(`Habitación con id: ${roomId} eliminada correctamente`);
                // Aquí podrías actualizar la lista de habitaciones
                fetchHabitaciones(); // Vuelve a cargar la lista de habitaciones
            } else {
                alert('Error al eliminar habitación: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error al eliminar la habitación:', error);
        });

        // Cerrar el modal después de la eliminación
        closeConfirmDeleteModal();
    } else {
        alert('Por favor, ingresa tu contraseña para confirmar la eliminación.');
    }
}


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
            <input type="checkbox" class="room-checkbox" data-id="${habitacion.id_habitacion}">
        `;
        roomListContainer.appendChild(div);
    });
}



function getSelectedRoomId() {
    const checkboxes = document.querySelectorAll('.room-checkbox');
    let selectedRoomId = null;
    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            if (selectedRoomId) {
                alert('Solo puedes seleccionar una habitación a la vez.');
                selectedRoomId = null;
            } else {
                selectedRoomId = checkbox.getAttribute('data-id');
            }
        }
    });
    return selectedRoomId;
}

function openAddRoomModal() {
    const modal = document.getElementById('addRoomModal');
    modal.style.display = 'flex'; // Asegura que el modal se muestre como flex para centrar
}

function closeAddRoomModal() {
    const modal = document.getElementById('addRoomModal');
    modal.style.display = 'none'; // Oculta el modal cuando se cierra
}

// Función para obtener la habitación seleccionada por el checkbox
function getSelectedRoomId() {
    const checkboxes = document.querySelectorAll('.room-checkbox');
    let selectedRoomId = null;

    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            selectedRoomId = checkbox.getAttribute('data-id'); // Asegurarse que el checkbox tenga data-id con id_habitacion
        }
    });

    return selectedRoomId;
}
function loadEditRoomImage(imageUrl) {
    const imagePreview = document.getElementById('editImagePreview');
    if (imageUrl) {
        imagePreview.style.backgroundImage = `url(${imageUrl})`;
        imagePreview.textContent = ''; // Limpiar texto "Previsualización"
    } else {
        imagePreview.style.backgroundImage = ''; // Limpiar previsualización si no hay imagen
        imagePreview.textContent = 'Previsualización'; // Mostrar texto por defecto
    }
}

function openEditRoomModal(roomId) {
    const editRoomModal = document.getElementById('editRoomModal');
    const fileInput = document.getElementById('editRoomImage'); // Usar el ID del input de archivo

    if (editRoomModal) {
        fetch(`/api/habitaciones/${roomId}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const room = data.habitacion;
                    // Rellenar los campos del formulario con los datos obtenidos
                    document.getElementById('editRoomId').value = room.id_habitacion;  // Usar id_habitacion
                    document.getElementById('editRoomName').value = room.nombre;
                    document.getElementById('editRoomType').value = room.tipo_habitacion;
                    document.getElementById('editRoomDescription').value = room.descripcion;
                    document.getElementById('editRoomPrice').value = room.precio_por_noche;
                    document.getElementById('editRoomAvailability').value = room.estado_disponibilidad;

                    // Cargar la imagen actual en el previsualizador
                    loadEditRoomImage(room.imagen);

                    // Limpiar el input de archivo
                    fileInput.value = ''; // Limpia el valor del input de archivo

                    // Mostrar el modal
                    editRoomModal.style.display = 'flex';
                } else {
                    console.error('Error al obtener los detalles de la habitación');
                }
            })
            .catch(error => console.error('Error:', error));
    } else {
        console.error('Modal de edición no encontrado.');
    }
}



function closeEditRoomModal() {
    const editRoomModal = document.getElementById('editRoomModal');
    editRoomModal.style.display = 'none';
}

function updateHabitacion() {
    const roomId = document.getElementById('editRoomId').value;
    const nombre = document.getElementById('editRoomName').value;
    const tipo_habitacion = document.getElementById('editRoomType').value;
    const descripcion = document.getElementById('editRoomDescription').value;
    const precio_por_noche = document.getElementById('editRoomPrice').value;
    const estado_disponibilidad = document.getElementById('editRoomAvailability').value;

    const data = {
        nombre,
        tipo_habitacion,
        descripcion,
        precio_por_noche,
        estado_disponibilidad,
        // Añadir el campo imagen_url si lo estás usando
    };

    fetch(`/api/habitaciones/${roomId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Habitación actualizada con éxito');
            closeEditRoomModal(); // Cerrar el modal
            // Aquí podrías volver a cargar la lista de habitaciones o actualizar la vista actual
        } else {
            alert('Error al actualizar la habitación');
        }
    })
    .catch(error => console.error('Error:', error));
}

function confirmDeleteModal(roomId) {
    const confirmDeleteModal = document.getElementById('confirmDeleteModal');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const deleteRoomId = document.getElementById('deleteRoomId');

    if (confirmDeleteModal) {
        deleteRoomId.value = roomId;
        confirmDeleteModal.style.display = 'flex';
    } else {
        console.error('Modal de confirmación de eliminación no encontrado.');
    }
}

function closeDeleteConfirmModal() {
    const confirmDeleteModal = document.getElementById('confirmDeleteModal');
    if (confirmDeleteModal) {
        confirmDeleteModal.style.display = 'none';
    }
}


function addHabitacion() {
    const form = document.getElementById('addRoomForm');
    const formData = new FormData(form); // No uses JSON.stringify aquí

    fetch('/api/habitaciones', {
        method: 'POST',
        body: formData // Enviar los datos como FormData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Habitación agregada con éxito');
            closeAddRoomModal();
            fetchHabitaciones(); // Refresca la lista de habitaciones
        } else {
            console.error('Error al agregar la habitación:', data.message);
        }
    })
    .catch(error => console.error('Error:', error));
}


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

function previewImage(inputId, previewId) {
    const file = document.getElementById(inputId).files[0];
    const preview = document.getElementById(previewId);

    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.style.backgroundImage = `url(${e.target.result})`;
            preview.textContent = ''; // Limpia el texto "Previsualización"
        };
        reader.readAsDataURL(file);
    }
}

