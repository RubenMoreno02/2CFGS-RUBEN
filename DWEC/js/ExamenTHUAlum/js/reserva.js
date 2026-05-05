// reserva.js - Lógica de la página de reserva

document.addEventListener("DOMContentLoaded", function () {
    main();
});

function main() {
    cargarDatosCoche();
    configurarFormulario();
}

// ─── Cargar datos del coche seleccionado ────────────────────────────────────

function cargarDatosCoche() {
    const cocheJSON = localStorage.getItem("cocheSeleccionado");
    if (!cocheJSON) {
        window.location.href = "index.html";
        return;
    }

    const coche = JSON.parse(cocheJSON);

    const listado = document.getElementById("listado");

    // Imagen
    const img = listado.querySelector("img");
    img.src = "img/" + coche.img;
    img.alt = coche.marca + " " + coche.modelo;

    // Título (h2 del card-title)
    const titulo = listado.querySelector(".card-title");
    titulo.textContent = coche.marca + " " + coche.modelo;

    // Precio (h2 dentro del bg-warning)
    const precio = listado.querySelector(".bg-warning h2");
    precio.textContent = Number(coche.precio).toLocaleString("es-ES") + " €";

    // Datos de la tabla: año, km, cambio, combustible
    // Los strong vacíos están en los col p-3 sin encabezado
    const strongs = listado.querySelectorAll(".row .col strong");
    strongs[0].textContent = coche.anyo;
    strongs[1].textContent = Number(coche.km).toLocaleString("es-ES") + " Km.";
    strongs[2].textContent = coche.cambio;
    strongs[3].textContent = coche.combustible;
}

// ─── Validación y envío del formulario ──────────────────────────────────────

function configurarFormulario() {
    const form = document.querySelector("form");

    form.addEventListener("submit", function (e) {
        e.preventDefault();

        const errorEl = document.getElementById("errorMensaje");
        errorEl.textContent = "";

        const errores = [];

        // Nombre y Apellidos
        const nombre = document.getElementById("nombreApellidos").value.trim();
        const regNombre = /^[\w ]{4,40}$/;
        if (nombre === "") {
            errores.push("El campo Nombre y Apellidos es obligatorio.");
        } else if (!regNombre.test(nombre)) {
            errores.push("El Nombre y Apellidos debe tener entre 4 y 40 caracteres.");
        }

        // DNI / CIF / NIA
        const dni = document.getElementById("dniCifNia").value.trim();
        const regDNI = /^\d{9}[A-Z]$/;          // 9 dígitos + 1 mayúscula
        const regCIF = /^[A-Z]\d{8}$/;           // 1 mayúscula + 8 dígitos
        const regNIA = /^X\d{7}[A-Z]$/;          // X + 7 dígitos + 1 mayúscula
        if (dni === "") {
            errores.push("El campo DNI, CIF o NIA es obligatorio.");
        } else if (!regDNI.test(dni) && !regCIF.test(dni) && !regNIA.test(dni)) {
            errores.push("El campo DNI/CIF/NIA no tiene un formato válido (DNI: 9 dígitos + letra; CIF: letra + 8 dígitos; NIA: X + 7 dígitos + letra).");
        }

        // Email
        const email = document.getElementById("email").value.trim();
        const regEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (email === "") {
            errores.push("El campo email es obligatorio.");
        } else if (!regEmail.test(email)) {
            errores.push("El email no tiene un formato válido (ejemplo@dominio.com).");
        }

        // Teléfono
        const telefono = document.getElementById("telefono").value.trim();
        const regTelefono = /^\(\d{3}\)\s\d{3}-\d{3}$/;
        if (telefono === "") {
            errores.push("El campo teléfono es obligatorio.");
        } else if (!regTelefono.test(telefono)) {
            errores.push("El teléfono debe tener el formato (999) 666-333.");
        }

        // Aceptar condiciones
        const aceptar = document.getElementById("aceptar").checked;
        if (!aceptar) {
            errores.push("Debes aceptar las condiciones de uso del sitio.");
        }

        // Mostrar errores o guardar
        if (errores.length > 0) {
            errorEl.innerHTML = errores.join("<br>");
            return;
        }

        // Guardar en localStorage
        const cocheJSON = localStorage.getItem("cocheSeleccionado");
        const coche = JSON.parse(cocheJSON);
        const nota = document.getElementById("nota").value.trim();

        const reserva = {
            coche: coche,
            cliente: {
                nombreApellidos: nombre,
                dniCifNia: dni,
                email: email,
                telefono: telefono,
                nota: nota
            }
        };

        localStorage.setItem("reserva", JSON.stringify(reserva));

        // Redirigir al inicio
        window.location.href = "index.html";
    });
}
