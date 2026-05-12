document.addEventListener("DOMContentLoaded", main);

function main() {
    cargarDatosCoche();     // Llena la parte superior con los datos del coche elegido
    configurarFormulario(); // Valida y gestiona el envío del formulario
}

// -------------------------------------------------------
// 1. CARGAR LOS DATOS DEL COCHE SELECCIONADO
// -------------------------------------------------------
function cargarDatosCoche() {
    const cocheGuardado = localStorage.getItem("cocheSeleccionado");
    if (!cocheGuardado) {
        alert("No se ha seleccionado ningún coche. Volviendo al inicio...");
        window.location.href = "index.html";
        return;
    }

    const coche = JSON.parse(cocheGuardado);

    // Rellenamos los elementos del DOM con los datos del coche
    document.getElementById("imagenCoche").src = `img/${coche.img}`;
    document.getElementById("tituloCoche").textContent = `${coche.marca} ${coche.modelo}`;
    document.getElementById("precioCoche").textContent = `${coche.precio} €`;
    document.getElementById("anyoCoche").textContent = coche.anyo;
    document.getElementById("kmCoche").textContent = `${coche.km} Km.`;
    document.getElementById("cambioCoche").textContent = coche.cambio;
    document.getElementById("combustibleCoche").textContent = coche.combustible;
}

// -------------------------------------------------------
// 2. VALIDACIÓN Y ENVÍO DEL FORMULARIO
// -------------------------------------------------------
function configurarFormulario() {
    const formulario = document.getElementById("formReserva");
    const errorMensaje = document.getElementById("errorMensaje");

    formulario.addEventListener("submit", function(evento) {
        evento.preventDefault(); // Evitamos que se envíe de forma tradicional

        // Obtenemos los valores
        const nombre = document.getElementById("nombreApellidos").value.trim();
        const dni = document.getElementById("dniCifNia").value.trim();
        const email = document.getElementById("email").value.trim();
        const telefono = document.getElementById("telefono").value.trim();
        const nota = document.getElementById("nota").value.trim();
        const aceptar = document.getElementById("aceptar").checked;

        // ----- Validaciones personalizadas -----
        let errores = [];

        // Nombre y Apellidos: obligatorio y de 4 a 40 caracteres
        if (nombre === "" || nombre.length < 4 || nombre.length > 40) {
            errores.push("Nombre y Apellidos debe tener entre 4 y 40 caracteres.");
        }

        // DNI / CIF / NIA
        const patronDNI = /^(\d{9}[A-Z])|([A-Z]\d{8})|(X\d{7}[A-Z])$/;
        if (!patronDNI.test(dni)) {
            errores.push("El DNI/CIF/NIA no tiene un formato válido.");
        }

        // Email (usamos el mismo patrón que el atributo pattern)
        const patronEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (!patronEmail.test(email)) {
            errores.push("El email no es válido.");
        }

        // Teléfono
        const patronTel = /^\(\d{3}\)\s\d{3}-\d{3}$/;
        if (!patronTel.test(telefono)) {
            errores.push("El teléfono debe tener el formato (999) 666-333.");
        }

        // Checkbox
        if (!aceptar) {
            errores.push("Debe aceptar las condiciones.");
        }

        // Si hay errores, los mostramos y paramos
        if (errores.length > 0) {
            errorMensaje.textContent = errores.join(" ");
            return;
        }

        // Si todo es correcto, construimos el objeto de reserva
        const cocheGuardado = localStorage.getItem("cocheSeleccionado");
        const coche = JSON.parse(cocheGuardado);

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

        // Guardamos la reserva en localStorage (array de reservas)
        let reservas = JSON.parse(localStorage.getItem("reservas")) || [];
        reservas.push(reserva);
        localStorage.setItem("reservas", JSON.stringify(reservas));

        // Limpiamos el coche seleccionado (ya no hace falta)
        localStorage.removeItem("cocheSeleccionado");

        // Redirigimos a la página principal
        window.location.href = "index.html";
    });
}