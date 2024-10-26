let hotelId = null; // Variable global para almacenar el id_hotel

document.addEventListener('DOMContentLoaded', function () {
    // Obtener el id del hotel asignado al administrador
    fetch('/api/admin-hotel')
        .then(response => response.json())
        .then(data => {
            if (data.id_hotel) {
                hotelId = data.id_hotel; // Guardar el id del hotel en una variable global
            } else {
                console.error(data.message);
            }
        })
        .catch(error => console.error('Error al obtener el hotel del administrador:', error));
});

// Función para obtener y mostrar el nombre de usuario
function obtenerNombreUsuario() {
    fetch('/api/username')
        .then(response => response.json())
        .then(data => {
            if (data.username) {
                document.getElementById('usernameDisplay').textContent = data.username;
            } else {
                console.error('Error al obtener el nombre de usuario:', data.message);
            }
        })
        .catch(error => console.error('Error:', error));
}

// Llamar a la función al cargar la página
document.addEventListener('DOMContentLoaded', obtenerNombreUsuario);



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
            showCustomAlert('Por favor, selecciona una habitación para eliminar.',"info");
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
            showCustomAlert('Por favor, selecciona una habitación para editar.',"info");
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
                showCustomAlert('Error al eliminar habitación: ' + data.message,"error");
            }
        })
        .catch(error => {
            console.error('Error al eliminar la habitación:', error);
        });

        // Cerrar el modal después de la eliminación
        closeConfirmDeleteModal();
    } else {
        showCustomAlert('Por favor, ingresa tu contraseña para confirmar la eliminación.',"info");
    }
}


document.addEventListener('DOMContentLoaded', function () {
    // Llamar a la función para cargar habitaciones al iniciar
    fetchHabitaciones();
});


document.addEventListener('DOMContentLoaded', fetchHabitaciones);

function fetchHabitaciones() {
    fetch('/api/habitacioness')
        .then(response => response.json())
        .then(data => {
            if (data.habitaciones) {
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
    // Verificar si hay habitaciones restantes antes de abrir el modal
    fetch('/api/admin-hotel')
        .then(response => response.json())
        .then(data => {
            if (data.id_hotel) {
                const hotelId = data.id_hotel;
                
                // Llama al endpoint para obtener el contador de habitaciones
                fetch(`/api/hotel/${hotelId}/contador-habitaciones`)
                    .then(response => response.json())
                    .then(data => {
                        const habitacionesRestantes = data.habitacionesRestantes;

                        if (habitacionesRestantes > 0) {
                            // Si quedan habitaciones, abre el modal
                            const modal = document.getElementById('addRoomModal');
                            modal.style.display = 'flex'; // Asegura que el modal se muestre como flex para centrar
                        } else {
                            // Si no hay habitaciones restantes, muestra la alerta
                            showCustomAlert('Has alcanzado el límite de habitaciones. Mejora el plan o elimina una habitación.',"warning");
                        }
                    })
                    .catch(error => console.error('Error al obtener el contador de habitaciones:', error));
            } else {
                console.error('Hotel no encontrado para el administrador.');
            }
        })
        .catch(error => console.error('Error al obtener el hotel del administrador:', error));
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
    fetch(`/api/habitaciones/${roomId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al obtener los detalles de la habitación');
            }
            return response.json();
        })
        .then(data => {
            console.log("Data received:", data);
            document.getElementById('editRoomId').value = roomId;

            // Acceder a las propiedades dentro del objeto `habitacion`
            const habitacion = data.habitacion;

            // Obtener y asignar valores a los campos
            const roomName = document.getElementById('editRoomName');
            const roomType = document.getElementById('editRoomType');
            const roomDescription = document.getElementById('editRoomDescription');
            const roomPrice = document.getElementById('editRoomPrice');
            const roomAvailability = document.getElementById('editRoomStatus');
            const imagePreview = document.getElementById('editImagePreview');
            
            if (roomName && roomType && roomDescription && roomPrice && roomAvailability) {
                roomName.value = habitacion.nombre || '';
                roomType.value = habitacion.tipo_habitacion || '';
                roomDescription.value = habitacion.descripcion || '';
                roomPrice.value = habitacion.precio_por_noche || '';
                roomAvailability.value = habitacion.estado_disponibilidad || '';

                // Configurar la imagen de previsualización
                const imageUrl = habitacion.imagen_url ? `http://localhost:3000/uploads/${habitacion.imagen_url}` : 'default-image.png';
                imagePreview.style.backgroundImage = `url(${imageUrl})`;
                imagePreview.textContent = ''; // Limpiar texto "Previsualización"
                
                document.getElementById('editRoomModal').style.display = 'block';
            } else {
                console.error("Uno o más elementos no se encontraron en el DOM.");
            }
        })
        .catch(error => console.error('Error:', error));
}

// Event listener para cambiar la imagen al hacer clic en la previsualización
document.getElementById('editImagePreview').addEventListener('click', function() {
    document.getElementById('editRoomImage').click(); // Abrir el selector de archivos
});

// Previsualizar la nueva imagen seleccionada
document.getElementById('editRoomImage').addEventListener('change', function() {
    previewImage('editRoomImage', 'editImagePreview');
});



function closeEditRoomModal() {
    const editRoomModal = document.getElementById('editRoomModal');
    editRoomModal.style.display = 'none';
}

function updateHabitacion() {
    const roomId = document.getElementById('editRoomId')?.value;
    const nombre = document.getElementById('editRoomName')?.value;
    const tipo_habitacion = document.getElementById('editRoomType')?.value;
    const descripcion = document.getElementById('editRoomDescription')?.value;
    const precio_por_noche = document.getElementById('editRoomPrice')?.value;
    const estado_disponibilidad = document.getElementById('editRoomStatus')?.value;
    const imagen = document.getElementById('editRoomImage')?.files[0]; // Obtener el archivo de imagen

    if (!roomId || !nombre || !tipo_habitacion || !descripcion || !precio_por_noche || !estado_disponibilidad) {
        console.error("Uno o más elementos no se encontraron en el DOM");
        return;
    }

    // Usar FormData para enviar datos y archivo de imagen
    const formData = new FormData();
    formData.append('nombre', nombre);
    formData.append('tipo_habitacion', tipo_habitacion);
    formData.append('descripcion', descripcion);
    formData.append('precio_por_noche', precio_por_noche);
    formData.append('estado_disponibilidad', estado_disponibilidad);

    if (imagen) {
        formData.append('imagen', imagen); // Solo agrega la imagen si se ha seleccionado una nueva
    }

    fetch(`/api/habitaciones/${roomId}`, {
        method: 'PUT',
        body: formData, // Enviar formData en lugar de JSON
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showCustomAlert('Habitación actualizada con éxito', "success");
            closeEditRoomModal(); // Cerrar el modal
            fetchHabitaciones(); // Volver a cargar la lista de habitaciones o actualizar la vista actual
        } else {
            showCustomAlert('Error al actualizar la habitación', "error");
        }
    })
    .catch(error => console.error('Error:', error));
}


// Función para obtener y mostrar el número de habitaciones restantes
function mostrarContadorHabitacionesRestantes() {
    fetch('/api/admin-hotel')
        .then(response => response.json())
        .then(data => {
            if (data.id_hotel) {
                const hotelId = data.id_hotel;
                
                // Llama al nuevo endpoint para obtener el contador de habitaciones
                fetch(`/api/hotel/${hotelId}/contador-habitaciones`)
                    .then(response => response.json())
                    .then(data => {
                        const habitacionesRestantes = data.habitacionesRestantes;
                        document.getElementById('contadorHabitaciones').textContent = `Habitaciones restantes: ${habitacionesRestantes}`;
                    })
                    .catch(error => console.error('Error al obtener el contador de habitaciones:', error));
            } else {
                console.error('Hotel no encontrado para el administrador.');
            }
        })
        .catch(error => console.error('Error al obtener el hotel del administrador:', error));
}

// Llamar a esta función al cargar la página
document.addEventListener('DOMContentLoaded', mostrarContadorHabitacionesRestantes);


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


// Asegúrate de llamar a mostrarContadorHabitacionesRestantes() cada vez que se agrega o elimina una habitación
function addHabitacion() {
    const form = document.getElementById('addRoomForm');
    const formData = new FormData(form);

    // Agregar el id del hotel al FormData antes de enviarlo
    if (hotelId) {
        formData.append('id_hotel', hotelId);
    } else {
        showCustomAlert('Error: No se encontró un hotel asignado al administrador',"error");
        return;
    }

    fetch('/api/habitaciones', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showCustomAlert('Habitación agregada con éxito',"success");
            closeAddRoomModal();
            fetchHabitaciones(); // Refresca la lista de habitaciones
            mostrarContadorHabitacionesRestantes(); // Actualiza el contador de habitaciones restantes
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
            showCustomAlert('Error al cerrar sesión: ' + data.message,"error");
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