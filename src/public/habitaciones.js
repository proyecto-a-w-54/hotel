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
