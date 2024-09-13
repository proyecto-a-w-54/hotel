document.addEventListener('DOMContentLoaded', function () {
    // Obtener elementos del DOM
    const addRoomForm = document.getElementById('addRoomForm');
    const addRoomButton = document.getElementById('addRoomButton');
    const addRoomModal = document.getElementById('addRoomModal');
    const closeAddRoomModalButton = document.querySelector('#addRoomModal .close');

    // Event listener para abrir el modal de agregar habitación
    addRoomButton.addEventListener('click', function () {
        openAddRoomModal();
    });

    // Event listener para cerrar el modal de agregar habitación
    closeAddRoomModalButton.addEventListener('click', function () {
        closeAddRoomModal();
    });

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

    // Función para cargar la lista de habitaciones al iniciar
    fetchHabitaciones();
});

function fetchHabitaciones() {
    fetch('/api/habitaciones')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                renderHabitaciones(data.habitaciones);
            } else {
                alert('Error al obtener habitaciones');
            }
        })
        .catch(error => console.error('Error:', error));
}

function renderHabitaciones(habitaciones) {
    const roomListContainer = document.getElementById('roomListContainer');
    roomListContainer.innerHTML = ''; // Limpiar la lista

    habitaciones.forEach(habitacion => {
        const li = document.createElement('li');
        li.className = 'habitacion-item';
        li.innerHTML = `
            <div class="habitacion-info">
                <img src="${habitacion.imagen_url}" alt="${habitacion.tipo_habitacion}" class="habitacion-image">
                <div class="habitacion-details">
                    <h3>${habitacion.tipo_habitacion}</h3>
                    <p>${habitacion.descripcion}</p>
                    <p>Precio por noche: ${habitacion.precio_por_noche}</p>
                    <p>Estado: ${habitacion.estado_disponibilidad}</p>
                </div>
            </div>
            <div class="habitacion-actions">
                <button class="edit-btn" onclick="openEditRoomModal(${habitacion.id_habitacion})"><i class="fa fa-edit"></i></button>
                <button class="delete-btn" onclick="openDeleteConfirmModal(${habitacion.id_habitacion})"><i class="fa fa-trash"></i></button>
            </div>
        `;
        roomListContainer.appendChild(li);
    });
}

function openAddRoomModal() {
    document.getElementById("addRoomModal").style.display = "block";
}

function closeAddRoomModal() {
    document.getElementById("addRoomModal").style.display = "none";
}

// Middleware de permisos (ejemplo en Express.js)
function verifyAdmin(req, res, next) {
    if (req.user && req.user.role === 'admin') {
        next(); // El usuario tiene permisos de administrador
    } else {
        return res.status(403).json({ message: 'No tienes los permisos necesarios' });
    }
}
// Usar el middleware en la ruta para crear habitaciones
app.post('/api/habitaciones', verifyAdmin, (req, res) => {
    function addHabitacion() {
        const formData = new FormData(document.getElementById('addRoomForm'));
        const data = Object.fromEntries(formData.entries());
        fetch('/api/habitaciones', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}` // Asegúrate de enviar el token correcto
            },
            body: JSON.stringify(roomData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                alert(data.message);
                fetchHabitaciones(); // Recargar la lista de habitaciones
                closeAddRoomModal(); // Cerrar el modal
            } else {
                alert('Error al agregar habitación');
            }
        })
        .catch(error => console.error('Error al agregar habitación:', error));
    }
});
function openEditRoomModal(id) {
    fetch(`/api/habitaciones/${id}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const habitacion = data.habitacion;
                document.getElementById('editRoomId').value = habitacion.id_habitacion;
                document.getElementById('editTipoHabitacion').value = habitacion.tipo_habitacion;
                document.getElementById('editDescripcion').value = habitacion.descripcion;
                document.getElementById('editPrecioPorNoche').value = habitacion.precio_por_noche;
                document.getElementById('editEstadoDisponibilidad').value = habitacion.estado_disponibilidad;
                document.getElementById('editImagenUrl').value = habitacion.imagen_url;

                document.getElementById('editRoomModal').style.display = 'block';
            } else {
                alert('Error al obtener detalles de habitación');
            }
        })
        .catch(error => console.error('Error:', error));
}

function updateHabitacion() {
    const id = document.getElementById('editRoomId').value;
    const formData = new FormData(document.getElementById('editRoomForm'));
    const data = Object.fromEntries(formData);

    fetch(`/api/habitaciones/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(data.message);
            fetchHabitaciones();
            closeEditRoomModal();
        } else {
            alert('Error al actualizar habitación');
        }
    })
    .catch(error => console.error('Error:', error));
}

function openDeleteConfirmModal(id) {
    document.getElementById('deleteRoomId').value = id;
    document.getElementById('confirmDeleteModal').style.display = 'block';
}

function closeConfirmDeleteModal() {
    document.getElementById('confirmDeleteModal').style.display = 'none';
}

function deleteHabitacion() {
    const id = document.getElementById('deleteRoomId').value;
    const password = document.getElementById('confirmPassword').value;

    fetch(`/api/habitaciones/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(data.message);
            fetchHabitaciones();
            closeConfirmDeleteModal();
        } else {
            alert('Error al eliminar habitación');
        }
    })
    .catch(error => console.error('Error:', error));
}
