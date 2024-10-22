document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const idHabitacion = urlParams.get('id'); // Obtener el ID de la habitación de la URL
    const addCommentButton = document.getElementById('addCommentButton');
    const commentModal = document.getElementById('commentModal');
    const closeCommentModalButton = document.querySelector('.close-button'); // Renombrar para evitar conflictos
    const stars = document.querySelectorAll('.star'); // Selecciona todas las estrellas
    let selectedRating = 0; // Variable para almacenar la calificación seleccionada

    fetchHabitacion(idHabitacion); // Obtener los detalles de la habitación
    fetchResenas(idHabitacion); // Obtener las reseñas de la habitación

    // Abrir el modal al hacer clic en el botón "+"
    addCommentButton.addEventListener('click', () => {
        commentModal.style.display = 'flex'; // Mostrar el modal
    });

    // Cerrar el modal de comentarios al hacer clic en la "X"
    closeCommentModalButton.addEventListener('click', () => {
        commentModal.style.display = 'none';
        clearCommentModal(); // Limpiar el contenido del modal al cerrar
    });

    // Cerrar el modal de comentarios si se hace clic fuera del contenido del modal
    window.addEventListener('click', (event) => {
        if (event.target === commentModal) {
            commentModal.style.display = 'none';
            clearCommentModal(); // Limpiar el contenido del modal al cerrar
        }
    });

    // Manejo de selección de estrellas
    stars.forEach(star => {
        star.addEventListener('click', function () {
            selectedRating = this.getAttribute('data-value'); // Obtener el valor de la estrella seleccionada
            stars.forEach(s => s.classList.remove('active')); // Eliminar la clase 'active' de todas las estrellas

            // Añadir la clase 'active' a todas las estrellas hasta la seleccionada
            for (let i = 0; i < selectedRating; i++) {
                stars[i].classList.add('active');
            }
        });
    });

    const submitButton = document.getElementById('submitComment'); // Asegúrate de que el ID coincida
    
    // Enviar comentario
    submitButton.addEventListener('click', function () {
        const commentText = document.getElementById('commentText').value;
        const idUsuario = localStorage.getItem('id_usuario'); // Obtiene el ID del usuario logueado

        console.log('ID del usuario obtenido desde localStorage:', idUsuario); // Verifica que se obtiene correctamente

        if (selectedRating > 0 && commentText) {
            const opinionData = {
                id_habitacion: idHabitacion, // Asegúrate de que idHabitacion tenga el valor correcto
                calificacion: selectedRating,
                comentario: commentText,
                id_usuario: idUsuario ? parseInt(idUsuario, 10) : null // Asegúrate de convertirlo a número
            };

            console.log('Datos a enviar:', opinionData); // Asegúrate de que id_usuario tenga un valor

            fetch('/api/opiniones', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(opinionData)
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Comentario añadido con éxito.');
                    commentModal.style.display = 'none'; // Cerrar el modal
                    clearCommentModal(); // Limpiar el contenido del modal
                    fetchResenas(idHabitacion); // Refrescar las reseñas
                } else {
                    alert('Error al añadir el comentario: ' + data.message);
                }
            })
            .catch(error => console.error('Error:', error));
        } else {
            alert('Por favor, completa la calificación y el comentario.');
        }
    });

    // Función para limpiar el modal de comentarios
    function clearCommentModal() {
        const commentText = document.getElementById('commentText');
        commentText.value = ''; // Limpiar el campo de texto
        const stars = document.querySelectorAll('.star');
        stars.forEach(star => star.classList.remove('active')); // Limpiar la selección de estrellas
        selectedRating = 0; // Resetear la calificación seleccionada
    }

    // Función para obtener los detalles de la habitación
    function fetchHabitacion(id) {
        fetch(`/api/habitaciones/${id}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    renderHabitacion(data.habitacion);
                } else {
                    console.error('Error al obtener la habitación:', data.message);
                    document.getElementById('habitacionDetailsContainer').innerHTML = '<p>Habitación no encontrada.</p>';
                }
            })
            .catch(error => console.error('Error:', error));
    }

    // Función para renderizar los detalles de la habitación
    function renderHabitacion(habitacion) {
        const container = document.getElementById('habitacionDetailsContainer');
        container.innerHTML = `
            <div class="habitacion-details-container">
                <div class="habitacion-image-container">
                    <img src="${habitacion.imagen_url ? `http://localhost:3000/uploads/${habitacion.imagen_url}` : '../imagenes/default-habitacion.jpg'}" alt="${habitacion.nombre || 'Habitación'}" class="habitacion-image">
                </div>
                <div class="habitacion-info">
                    <h1>${habitacion.nombre || 'Nombre no disponible'}</h1>
                    <p>Tipo: ${habitacion.tipo_habitacion || 'No disponible'}</p>
                    <p>Precio por noche: ${habitacion.precio_por_noche || 'No disponible'}</p>
                    <p>Estado: ${habitacion.estado_disponibilidad || 'No disponible'}</p>
                    <button id="reservarButton" class="reservar-button">Reservar</button> <!-- Botón de reservar -->
                </div>
            </div>
            <div class="habitacion-descripcion">
                <h2>Descripción</h2>
                <p>${habitacion.descripcion || 'No disponible'}</p>
            </div>
        `;

        // Agregar el evento de clic para el botón de reservar
        const reservarButton = document.getElementById('reservarButton');
        reservarButton.addEventListener('click', () => { openReservaModal(habitacion);
            const idUsuario = localStorage.getItem('id_usuario'); // Obtener el ID del usuario logueado

           
        });
    }

    // Función para abrir el modal de reserva
    function openReservaModal(habitacion) {
        const reservaModal = document.getElementById('reservaModal'); // Asegúrate de que este ID coincida con el del modal
        reservaModal.style.display = 'flex'; // Mostrar el modal

        // Aquí puedes rellenar el modal con la información de la habitación
        document.getElementById('modalHabitacionNombre').textContent = habitacion.nombre;
        document.getElementById('modalHabitacionPrecio').textContent = `Precio por noche: ${habitacion.precio_por_noche}`;
        // Agrega más campos según lo necesites
    }

    // Agregar el evento para cerrar el modal de reserva
    const closeReservaModalButton = document.querySelector('.close-modal-button'); // Renombrar para evitar conflictos
    closeReservaModalButton.addEventListener('click', () => {
        const reservaModal = document.getElementById('reservaModal');
        reservaModal.style.display = 'none';
    });

    // Opcional: Cerrar el modal si se hace clic fuera del contenido del modal
    window.addEventListener('click', (event) => {
        const reservaModal = document.getElementById('reservaModal');
        if (event.target === reservaModal) {
            reservaModal.style.display = 'none';
        }
    });

    function fetchResenas(id) {
        fetch(`/api/opiniones?habitacionId=${id}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error en la respuesta de la red'); // Manejo de errores
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    renderResenas(data.resenas);
                } else {
                    console.error('Error al obtener reseñas:', data.message);
                }
            })
            .catch(error => console.error('Error:', error));
    }

    // Función para renderizar las reseñas en el contenedor
    function renderResenas(resenas) {
        const container = document.getElementById('resenasContainer');

        // Si no hay reseñas, muestra un mensaje
        if (!resenas || resenas.length === 0) {
            container.innerHTML = '<p>No hay reseñas disponibles.</p>';
            return;
        }

        // Renderizar las reseñas
        container.innerHTML = resenas.map(resena => `
            <div class="resena"> 
                <p><strong>${resena.usuario_nombre || 'Usuario Anónimo'}</strong> - 
                calificación: ${'★'.repeat(resena.calificacion)} 
                <span>${resena.fecha_opinion}</span></p>
                <p>${resena.comentario}</p>
            </div>
        `).join('');
    }
}); // Cerrar el listener de DOMContentLoaded
