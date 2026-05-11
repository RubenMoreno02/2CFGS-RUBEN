// Se ejecuta cuando el DOM está listo
document.addEventListener('DOMContentLoaded', main);

/**
 * Función principal: carga los datos del jugador desde localStorage
 * y configura la validación del formulario.
 */
function main() {
    cargarDatosJugador();
    configurarValidacionFormulario();
}

/**
 * Recupera el jugador almacenado en localStorage y llena
 * los elementos HTML sin modificar las etiquetas originales.
 */
function cargarDatosJugador() {
    const jugadorGuardado = localStorage.getItem('jugadorSeleccionado');
    if (!jugadorGuardado) {
        document.getElementById('listado').innerHTML =
            '<div class="alert alert-warning">No se ha seleccionado ningún jugador. <a href="index.html">Volver al inicio</a></div>';
        return;
    }

    const jugador = JSON.parse(jugadorGuardado);

    // Rellenar imagen
    const img = document.querySelector('#listado .card-img-top');
    if (img) {
        img.src = jugador.img;
        img.alt = jugador.nombre;
    }

    // Rellenar nombre en el título
    const titulo = document.querySelector('#listado .card-title');
    if (titulo) titulo.textContent = jugador.nombre;

    // Rellenar valor en la caja amarilla (segundo h2)
    const valorDiv = document.querySelector('#listado .bg-warning h2');
    if (valorDiv) valorDiv.textContent = `${jugador.valor}M€`;

    // Obtener los elementos <strong> donde irán las estadísticas
    // El orden de los <strong> es: Año (edad), Kilometros (partidos), Cambio (posición), Combustible (nacionalidad)
    const strongs = document.querySelectorAll('#listado .row .col.p-3.text-center strong');
    if (strongs.length >= 4) {
        strongs[0].textContent = jugador.edad;         // "Año" -> Edad
        strongs[1].textContent = jugador.partidos;     // "Kilometros" -> Partidos
        strongs[2].textContent = jugador.posicion;     // "Cambio" -> Posición
        strongs[3].textContent = jugador.nacionalidad; // "Combustible" -> Nacionalidad
    }
}

/**
 * Agrega la validación personalizada y el envío del formulario.
 */
function configurarValidacionFormulario() {
    const formulario = document.getElementById('formReserva');
    const errorMensaje = document.getElementById('errorMensaje');

    formulario.addEventListener('submit', (e) => {
        e.preventDefault(); // Evitar envío por defecto

        // Obtener campos
        const nombreApellidos = document.getElementById('nombreApellidos');
        const dniCifNia = document.getElementById('dniCifNia');
        const email = document.getElementById('email');
        const telefono = document.getElementById('telefono');
        const aceptar = document.getElementById('aceptar');

        // Reiniciar mensaje de error
        errorMensaje.textContent = '';

        // Validaciones una a una, con mensajes específicos
        if (!nombreApellidos.value.trim()) {
            errorMensaje.textContent = 'El nombre y apellidos es obligatorio.';
            nombreApellidos.focus();
            return;
        }
        if (nombreApellidos.value.trim().length < 4 || nombreApellidos.value.trim().length > 40) {
            errorMensaje.textContent = 'El nombre y apellidos debe tener entre 4 y 40 caracteres.';
            nombreApellidos.focus();
            return;
        }

        if (!dniCifNia.value.trim()) {
            errorMensaje.textContent = 'El campo DNI/CIF/NIA es obligatorio.';
            dniCifNia.focus();
            return;
        }
        // Comprobar el patrón del DNI/CIF/NIA
        const dniPattern = /^(\d{9}[A-Z])|([A-Z]\d{8})|(X\d{7}[A-Z])$/;
        if (!dniPattern.test(dniCifNia.value.trim())) {
            errorMensaje.textContent = 'El formato del DNI/CIF/NIA no es válido. Debe ser 9 dígitos+letra, letra+8 dígitos o X+7 dígitos+letra.';
            dniCifNia.focus();
            return;
        }

        if (!email.value.trim()) {
            errorMensaje.textContent = 'El email es obligatorio.';
            email.focus();
            return;
        }
        // Validación adicional de email (HTML5 ya lo hace, pero aquí personalizamos mensaje)
        const emailPattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (!emailPattern.test(email.value.trim())) {
            errorMensaje.textContent = 'El formato del email no es correcto.';
            email.focus();
            return;
        }

        if (!telefono.value.trim()) {
            errorMensaje.textContent = 'El teléfono es obligatorio.';
            telefono.focus();
            return;
        }
        const telfPattern = /^\(\d{3}\)\s\d{3}-\d{3}$/;
        if (!telfPattern.test(telefono.value.trim())) {
            errorMensaje.textContent = 'El formato del teléfono debe ser (999) 666-333.';
            telefono.focus();
            return;
        }

        if (!aceptar.checked) {
            errorMensaje.textContent = 'Debe aceptar las condiciones del sitio.';
            aceptar.focus();
            return;
        }

        // Si todo es correcto, construir objeto de reserva y guardar
        const jugador = JSON.parse(localStorage.getItem('jugadorSeleccionado') || '{}');
        const reserva = {
            jugador: jugador,
            cliente: {
                nombreApellidos: nombreApellidos.value.trim(),
                dniCifNia: dniCifNia.value.trim(),
                email: email.value.trim(),
                telefono: telefono.value.trim(),
                nota: document.getElementById('nota').value.trim()
            }
        };

        // Guardar en localStorage (podríamos mantener un historial, pero aquí sobrescribimos)
        localStorage.setItem('ultimaReserva', JSON.stringify(reserva));

        // Redirigir a la página de inicio
        window.location.href = 'index.html';
    });
}