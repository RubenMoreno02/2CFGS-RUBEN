// JavaScript para mostrar/ocultar el menú al hacer clic en la hamburguesa
document.getElementById('hamburger-btn').addEventListener('click', function() {
    // Selecciona el menú de navegación
    var menu = document.querySelector('.nav-menu');

    // Añade o elimina la clase "active" para mostrar o esconder el menú
    menu.classList.toggle('active');
});
