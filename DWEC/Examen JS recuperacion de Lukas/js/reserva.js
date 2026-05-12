document.addEventListener('DOMContentLoaded', () => {
    // 1. Primero pedimos los datos
    fetch('js/bbdd.json')
        .then(response => response.json())
        .then(jsonData => {
            // 2. Una vez que los tenemos, los guardamos en una variable global
            // para que mainReserva pueda verlos
            window.data = jsonData; 
            
            // 3. Y SOLO ENTONCES ejecutamos la lógica de la página
            mainReserva();
        })
        .catch(error => {
            console.error('Error al cargar el JSON:', error);
            // Si hay error, podrías redirigir al index
            // window.location.href = 'index.html';
        });
});


function mainReserva() {
    // Solo declaramos estas variables UNA VEZ
    const params = new URLSearchParams(window.location.search);
    const id = parseInt(params.get('id'));
    
    // Accedemos a data.cars (que viene del fetch global)
    const coche = data.cars[id];

    if (!coche) {
        window.location.href = 'index.html';
        return;
    }

    // --- A partir de aquí, el resto del código para pintar los datos ---
    const precioFormateado = parseInt(coche.precio).toLocaleString('es-ES');
    const kmFormateado     = parseInt(coche.km).toLocaleString('es-ES');

    const img = document.querySelector('.card-img-top');
    img.src = 'img/' + coche.img;
    img.alt = coche.marca + ' ' + coche.modelo;

    const titulo = document.querySelector('.card-title');
    titulo.innerHTML = ''; // Limpiamos antes de añadir
    titulo.appendChild(document.createTextNode(coche.marca + ' ' + coche.modelo));

    const precio = document.querySelector('.font-weight-bold');
    precio.innerHTML = ''; // Limpiamos antes de añadir
    precio.appendChild(document.createTextNode(precioFormateado + ' €'));

    const strongs = document.querySelectorAll('strong');
    // Asegúrate de limpiar o asignar directamente para no duplicar texto si recargas
    strongs[0].textContent = coche.anyo;
    strongs[1].textContent = kmFormateado + ' Km.';
    strongs[2].textContent = coche.cambio;
    strongs[3].textContent = coche.combustible;


    // =============================================
    // BLOQUE 7 — Validación del formulario
    // =============================================

    // --- Expresiones regulares ---
    const regexNombre   = /^[\w ]{4,40}$/;
    const regexDNI      = /^\d{9}[A-Z]$/;
    const regexCIF      = /^[A-Z]\d{8}$/;
    const regexNIE      = /^X\d{7}[A-Z]$/;
    const regexEmail = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
    const regexTelefono = /^\(\d{3}\)\s\d{3}-\d{3}$/;

    // --- Captura del submit ---
    const form = document.querySelector('form');

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const errorMensaje = document.getElementById('errorMensaje');
        limpiarNodos(errorMensaje);

        // Leer valores
        const nombre   = document.getElementById('nombreApellidos').value.trim();
        const dni      = document.getElementById('dniCifNia').value.trim();
        const email    = document.getElementById('email').value.trim();
        const telefono = document.getElementById('telefono').value.trim();
        const nota     = document.getElementById('nota').value.trim();
        const aceptar  = document.getElementById('aceptar').checked;

        // --- Acumular errores ---
        const errores = [];

        // Nombre
        if (nombre === '') {
            errores.push('El nombre y apellidos es obligatorio.');
        } else if (!regexNombre.test(nombre)) {
            errores.push('El nombre y apellidos debe tener entre 4 y 40 caracteres.');
        }

        // DNI / CIF / NIE — debe cumplir al menos uno de los tres
        if (dni === '') {
            errores.push('El DNI, CIF o NIE es obligatorio.');
        } else if (!regexDNI.test(dni) && !regexCIF.test(dni) && !regexNIE.test(dni)) {
            errores.push('El DNI (9 dígitos + letra), CIF (letra + 8 dígitos) o NIE (X + 7 dígitos + letra) no es válido.');
        }

        // Email
        if (email === '') {
            errores.push('El email es obligatorio.');
        } else if (!regexEmail.test(email)) {
            errores.push('El formato del email no es válido.');
        }

        // Teléfono
        if (telefono === '') {
            errores.push('El teléfono es obligatorio.');
        } else if (!regexTelefono.test(telefono)) {
            errores.push('El teléfono debe tener el formato (999) 666-333.');
        }

        // Checkbox aceptar condiciones
        if (!aceptar) {
            errores.push('Debes aceptar las condiciones de uso del sitio.');
        }

        // --- Si hay errores, mostrarlos todos y parar ---
        if (errores.length > 0) {
            errores.forEach(function (error) {
                const linea = document.createElement('p');
                linea.appendChild(document.createTextNode(error));
                errorMensaje.appendChild(linea);
            });
            return;
        }

        // =============================================
        // BLOQUE 8 — Guardar en localStorage y redirigir
        // =============================================

        const reserva = {
            coche: coche,
            cliente: {
                nombreApellidos: nombre,
                dniCifNia:       dni,
                email:           email,
                telefono:        telefono,
                nota:            nota
            }
        };

        localStorage.setItem('reserva', JSON.stringify(reserva));

        // Redirigir al inicio
        window.location.href = 'index.html';
    });

}