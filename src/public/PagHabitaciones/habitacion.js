document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const idHabitacion = urlParams.get('id'); // Obtener el ID de la habitación de la URL
    const modal = document.getElementById('commentModal');
    const openModalButton = document.getElementById('openCommentModal');
    const closeModalButton = document.querySelector('.close-button');
    const submitButton = document.getElementById('submitComment');
    const stars = document.querySelectorAll('.star');
    let selectedRating = 0;

    fetchHabitacion(idHabitacion); // Llamar a la función para obtener los detalles de la habitación
    fetchResenas(idHabitacion); // Llamar a la función para obtener las reseñas de la habitación

    // Mostrar modal
    openModalButton.addEventListener('click', function () {
        modal.style.display = 'block';
    });

    // Cerrar modal
    closeModalButton.addEventListener('click', function () {
        modal.style.display = 'none';
    });

    // Selección de estrellas
    stars.forEach(star => {
        star.addEventListener('click', function () {
            selectedRating = this.getAttribute('data-value');
            stars.forEach(s => s.classList.remove('active'));
            this.classList.add('active');
            for (let i = 0; i < selectedRating; i++) {
                stars[i].classList.add('active');
            }
        });
    });

    // Enviar comentario
    submitButton.addEventListener('click', function () {
        const commentText = document.getElementById('commentText').value;
        const idHabitacion = new URLSearchParams(window.location.search).get('id');

        if (selectedRating > 0 && commentText) {
            const opinionData = {
                id_habitacion: idHabitacion,
                calificacion: selectedRating,
                comentario: commentText,
                fecha_opinion: new Date().toISOString().split('T')[0]
            };

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
                    modal.style.display = 'none';
                } else {
                    alert('Error al añadir el comentario.');
                }
            })
            .catch(error => console.error('Error:', error));
        } else {
            alert('Por favor, completa la calificación y el comentario.');
        }
    });


    fetchHabitacion(idHabitacion); // Llamar a la función para obtener los detalles de la habitación
});

function fetchHabitacion(id) {
    fetch(`/api/habitaciones/${id}`) // Llamar al endpoint para obtener la habitación por ID
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
                <div class="reservar-container">
                    <button class="reservar-button">Reservar</button>
                </div>
            </div>
        </div>
        <div class="habitacion-descripcion">
            <h2>Descripción</h2>
            <p>${habitacion.descripcion || 'No disponible'}
        </div>
        <div id="commentModal" class="modal">
            <div class="modal-content">
                <span class="close-button">&times;</span>
                <h3>Comentar de Habitación</h3>
                <textarea id="commentText" placeholder="Escribe tu comentario..."></textarea>
                <div class="rating-container">
                    <label for="rating">Calificación:</label>
                    <div class="stars" id="ratingStars">
                        <span data-value="1" class="star">&#9733;</span>
                        <span data-value="2" class="star">&#9733;</span>
                        <span data-value="3" class="star">&#9733;</span>
                        <span data-value="4" class="star">&#9733;</span>
                        <span data-value="5" class="star">&#9733;</span>
                    </div>
                </div>
                    <button id="submitComment" class="submit-button">Publicar</button>
                </div>
            </div>
    `;
}
function fetchResenas(idHabitacion) {
    fetch(`/api/opiniones?habitacionId=${idHabitacion}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                renderResenas(data.resenas);
            } else {
                console.error('Error al obtener las reseñas:', data.message);
                document.getElementById('resenasContainer').innerHTML = '<p>No hay reseñas disponibles.</p>';
            }
        })
        .catch(error => console.error('Error:', error));
}
function renderResenas(resenas) {
    const container = document.getElementById('resenasContainer');
    container.innerHTML = resenas.map(resena => `
        <div class="resena"> </p><button id="addCommentButton" class="add-comment-button">+</button>
            <p><strong>${resena.usuario_nombre || 'Usuario Anónimo'}</strong> - calificación: ${'★'.repeat(resena.calificacion)} <span>${resena.fecha_opinion}</span></p>
            <p>${resena.comentario}</p>
        </div>
    `).join('');
}



