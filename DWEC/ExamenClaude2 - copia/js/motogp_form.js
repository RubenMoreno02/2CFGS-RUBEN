/**
 * MotoGP Manager — form.js
 * Página: formulario.html
 * Gestiona: alta de nuevo piloto + edición de piloto existente
 *
 * VALIDACIONES: combinación de checkValidity() + regex personalizadas
 * MENSAJES: en el DOM, clase 'visible' en .error-msg — SIN tooltips HTML5
 */

document.addEventListener('DOMContentLoaded', main);

function main() {

    // ── Detectar modo: alta o edición ────────────────────────────────────────
    // Leemos el parámetro ?id=X de la URL
    const params = new URLSearchParams(window.location.search);
    const idEdicion = params.get('id'); // null si es alta, string con el id si es edición

    if (idEdicion) {
        // MODO EDICIÓN: cambiar título y precargar datos del piloto
        limpiarNodos(document.getElementById('tituloFormulario'));
        document.getElementById('tituloFormulario')
            .appendChild(document.createTextNode('Editar piloto'));

        // TODO: buscar el piloto en localStorage por id y rellenar los inputs
        // const pilotos = getPilotos();
        // const piloto = pilotos.find(p => p.id === parseInt(idEdicion));
        // if (piloto) precargarFormulario(piloto);
    }

    // ── Evento submit ─────────────────────────────────────────────────────────
    document.getElementById('formularioPiloto').addEventListener('submit', function (e) {
        e.preventDefault(); // evitamos recarga de página

        // Validamos todos los campos — si alguno falla paramos
        const valido = validarFormulario();
        if (!valido) return;

        // Construimos el objeto piloto con los datos del formulario
        const piloto = leerFormulario();

        // Guardamos en localStorage
        const pilotos = getPilotos();

        if (idEdicion) {
            // MODO EDICIÓN: reemplazamos el piloto existente
            const indice = pilotos.findIndex(p => p.id === parseInt(idEdicion));
            if (indice !== -1) {
                piloto.id = parseInt(idEdicion); // conservamos el id original
                pilotos[indice] = piloto;
            }
        } else {
            // MODO ALTA: asignamos un id único y lo añadimos
            piloto.id = Date.now();
            pilotos.push(piloto);
        }

        setPilotos(pilotos);

        // Redirigimos al panel principal
        window.location.href = 'index.html';
    });
}

// ══════════════════════════════════════════════════════════════════════════════
// VALIDACIONES
// Combina checkValidity() (API nativa) con regex personalizadas
// Muestra/oculta mensajes de error en el DOM (clase 'visible')
// ══════════════════════════════════════════════════════════════════════════════

function validarFormulario() {
    let formularioValido = true;

    // ── Nombre ───────────────────────────────────────────────────────────────
    const inputNombre = document.getElementById('inputNombre');
    const regexNombre = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,30}$/;

    // Primero limpiamos el error personalizado anterior
    inputNombre.setCustomValidity('');

    if (!regexNombre.test(inputNombre.value.trim())) {
        // Si no pasa la regex, ponemos un mensaje personalizado
        // Esto hace que checkValidity() devuelva false
        inputNombre.setCustomValidity('Formato incorrecto');
    }

    // checkValidity() comprueba required, minlength, maxlength Y setCustomValidity
    if (!inputNombre.checkValidity()) {
        mostrarError('errorNombre');
        formularioValido = false;
    } else {
        ocultarError('errorNombre');
    }

    // ── Apellidos ─────────────────────────────────────────────────────────────
    const inputApellidos = document.getElementById('inputApellidos');
    const regexApellidos = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,50}$/;

    inputApellidos.setCustomValidity('');
    if (!regexApellidos.test(inputApellidos.value.trim())) {
        inputApellidos.setCustomValidity('Formato incorrecto');
    }
    if (!inputApellidos.checkValidity()) {
        mostrarError('errorApellidos');
        formularioValido = false;
    } else {
        ocultarError('errorApellidos');
    }

    // ── Año de nacimiento ─────────────────────────────────────────────────────
    const inputAnyo = document.getElementById('inputAnyo');
    // checkValidity() ya comprueba min="1970" max="2010" y required
    inputAnyo.setCustomValidity('');
    if (!inputAnyo.checkValidity()) {
        mostrarError('errorAnyo');
        formularioValido = false;
    } else {
        ocultarError('errorAnyo');
    }

    // ── Equipo ────────────────────────────────────────────────────────────────
    const inputEquipo = document.getElementById('inputEquipo');
    inputEquipo.setCustomValidity('');
    if (!inputEquipo.checkValidity()) {
        mostrarError('errorEquipo');
        formularioValido = false;
    } else {
        ocultarError('errorEquipo');
    }

    // ── Nacionalidad ──────────────────────────────────────────────────────────
    const inputNac = document.getElementById('inputNacionalidad');
    const regexNac = /^[A-Z]{3}$/; // exactamente 3 letras mayúsculas

    inputNac.setCustomValidity('');
    if (!regexNac.test(inputNac.value.trim())) {
        inputNac.setCustomValidity('Formato incorrecto');
    }
    if (!inputNac.checkValidity()) {
        mostrarError('errorNacionalidad');
        formularioValido = false;
    } else {
        ocultarError('errorNacionalidad');
    }

    // ── Número de dorsal ──────────────────────────────────────────────────────
    const inputNumero = document.getElementById('inputNumero');
    inputNumero.setCustomValidity('');
    if (!inputNumero.checkValidity()) {
        mostrarError('errorNumero');
        formularioValido = false;
    } else {
        ocultarError('errorNumero');
    }

    // ── Estadísticas (mundiales, victorias, podios) ───────────────────────────
    ['inputMundiales', 'inputVictorias', 'inputPodios'].forEach(function (inputId) {
        const input = document.getElementById(inputId);
        const errorId = 'error' + inputId.replace('input', '');
        input.setCustomValidity('');
        if (!input.checkValidity()) {
            mostrarError(errorId);
            formularioValido = false;
        } else {
            ocultarError(errorId);
        }
    });

    // ── URL imagen ────────────────────────────────────────────────────────────
    const inputImagen = document.getElementById('inputImagen');
    const regexUrl = /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i;

    inputImagen.setCustomValidity('');
    if (!regexUrl.test(inputImagen.value.trim())) {
        inputImagen.setCustomValidity('URL de imagen no válida');
    }
    if (!inputImagen.checkValidity()) {
        mostrarError('errorImagen');
        formularioValido = false;
    } else {
        ocultarError('errorImagen');
    }

    return formularioValido;
}

// ══════════════════════════════════════════════════════════════════════════════
// LEER FORMULARIO — construye el objeto piloto con los valores de los inputs
// ══════════════════════════════════════════════════════════════════════════════

function leerFormulario() {
    return {
        nombre:     document.getElementById('inputNombre').value.trim(),
        apellidos:  document.getElementById('inputApellidos').value.trim(),
        anyo:       parseInt(document.getElementById('inputAnyo').value),
        equipo:     document.getElementById('inputEquipo').value.trim(),
        nacionalidad: document.getElementById('inputNacionalidad').value.trim().toUpperCase(),
        numero:     parseInt(document.getElementById('inputNumero').value),
        mundiales:  parseInt(document.getElementById('inputMundiales').value) || 0,
        victorias:  parseInt(document.getElementById('inputVictorias').value) || 0,
        podios:     parseInt(document.getElementById('inputPodios').value) || 0,
        imagen:     document.getElementById('inputImagen').value.trim(),
    };
}

// ══════════════════════════════════════════════════════════════════════════════
// PRECARGA — rellena el formulario con los datos de un piloto existente (edición)
// ══════════════════════════════════════════════════════════════════════════════

function precargarFormulario(piloto) {
    document.getElementById('inputNombre').value      = piloto.nombre;
    document.getElementById('inputApellidos').value   = piloto.apellidos;
    document.getElementById('inputAnyo').value        = piloto.anyo;
    document.getElementById('inputEquipo').value      = piloto.equipo;
    document.getElementById('inputNacionalidad').value = piloto.nacionalidad;
    document.getElementById('inputNumero').value      = piloto.numero;
    document.getElementById('inputMundiales').value   = piloto.mundiales;
    document.getElementById('inputVictorias').value   = piloto.victorias;
    document.getElementById('inputPodios').value      = piloto.podios;
    document.getElementById('inputImagen').value      = piloto.imagen;
}

// ══════════════════════════════════════════════════════════════════════════════
// UTILIDADES
// ══════════════════════════════════════════════════════════════════════════════

function mostrarError(idElemento) {
    document.getElementById(idElemento).classList.add('visible');
}

function ocultarError(idElemento) {
    document.getElementById(idElemento).classList.remove('visible');
}

function limpiarNodos(elemento) {
    while (elemento.firstChild) {
        elemento.removeChild(elemento.firstChild);
    }
}

function getPilotos() {
    try {
        return JSON.parse(localStorage.getItem('pilotos')) || [];
    } catch (e) {
        localStorage.removeItem('pilotos');
        return [];
    }
}

function setPilotos(pilotos) {
    localStorage.setItem('pilotos', JSON.stringify(pilotos));
}
