// ============================================================
// ARCHIVO: reserva.js  →  Lógica de la página de reserva
//
// Esta página hace DOS cosas:
// 1. Carga los datos del coche seleccionado (desde sessionStorage)
// 2. Valida el formulario del cliente y guarda la reserva
//
// IMPORTANTE: NO podemos añadir id="" a elementos del HTML existente.
// Debemos buscar los elementos por otros métodos (querySelector, etc.)
// ============================================================

document.addEventListener("DOMContentLoaded", function main() {

    // ----------------------------------------------------------
    // PASO 1: Recuperar el coche seleccionado del sessionStorage
    // ----------------------------------------------------------

    // "sessionStorage.getItem(clave)" recupera lo que guardamos antes
    // Nos devuelve un STRING (texto), no un objeto JS
    let cocheJSON = sessionStorage.getItem("cocheSeleccionado");

    // Si no hay coche guardado (el usuario entró directo a reserva.html sin seleccionar)
    // lo mandamos de vuelta al inicio
    if (!cocheJSON) {
        // "window.location.href" cambia la página actual
        window.location.href = "index.html";
        return; // Salimos de main() para no continuar ejecutando
    }

    // "JSON.parse(texto)" convierte el texto JSON de vuelta a objeto JS
    // Es el proceso inverso a JSON.stringify()
    let coche = JSON.parse(cocheJSON);


    // ----------------------------------------------------------
    // PASO 2: Cargar los datos del coche en el HTML
    // CRITERIO 14: Sin modificar el HTML (no podemos añadir ids)
    //
    // Usamos querySelector con selectores CSS para encontrar elementos:
    // ".card-title"    → el primer elemento con clase card-title
    // ".bg-warning h2" → el h2 dentro del elemento con clase bg-warning
    // ".card-img-top"  → la imagen
    // etc.
    // ----------------------------------------------------------

    // Título del coche (marca y modelo)
    // querySelector busca el PRIMER elemento que coincida
    document.querySelector(".card-title").textContent = coche.marca + " " + coche.modelo;

    // Precio (dentro del div amarillo bg-warning)
    let precioFormateado = parseInt(coche.precio).toLocaleString('es-ES') + " €";
    document.querySelector(".bg-warning h2").textContent = precioFormateado;

    // Imagen del coche
    let imgCoche = document.querySelector(".card-img-top");
    imgCoche.src = "img/" + coche.img;
    imgCoche.alt = coche.marca + " " + coche.modelo;

    // Los datos de la tabla (Año, Km, Cambio, Combustible)
    // Buscamos todos los <strong> dentro de las columnas de datos
    // "querySelectorAll" devuelve TODOS los elementos que coincidan (una lista)
    let celdasDatos = document.querySelectorAll(".card-body .row .col strong");

    // celdasDatos[0] = Año, [1] = Km, [2] = Cambio, [3] = Combustible
    // (en el mismo orden que aparecen en el HTML)
    if (celdasDatos.length >= 4) {
        celdasDatos[0].textContent = coche.anyo;
        celdasDatos[1].textContent = parseInt(coche.km).toLocaleString('es-ES') + " Km.";
        celdasDatos[2].textContent = coche.cambio;
        celdasDatos[3].textContent = coche.combustible;
    }


    // ----------------------------------------------------------
    // PASO 3: Capturar el envío del formulario
    // CRITERIO 11: Validación HTML5 con regex
    // CRITERIO 12: Capturar errores en JS
    // CRITERIO 13: Mostrar mensajes unificados
    // ----------------------------------------------------------

    // Obtenemos el botón "Enviar"
    let btnEnviar = document.getElementById("enviar");

    btnEnviar.addEventListener("click", function (e) {
        // Evitamos que el formulario se envíe y recargue la página
        e.preventDefault();

        // Limpiamos el mensaje de error anterior
        document.getElementById("errorMensaje").textContent = "";

        // Leemos los valores de cada campo del formulario
        let nombreApellidos = document.getElementById("nombreApellidos").value.trim();
        let dniCifNia = document.getElementById("dniCifNia").value.trim();
        let email = document.getElementById("email").value.trim();
        let telefono = document.getElementById("telefono").value.trim();
        let nota = document.getElementById("nota").value.trim();
        let aceptar = document.getElementById("aceptar").checked; // checkbox: true/false

        // --- VALIDACIONES ---
        // Acumulamos todos los errores en un array para mostrarlos juntos
        let errores = [];

        // Validación 1: Nombre y Apellidos
        // Obligatorio y entre 4 y 40 caracteres
        // La regex del HTML es: ^[\w ]{4,40}$
        //   ^ = inicio del texto
        //   [\w ] = letras, números, guión bajo O espacio
        //   {4,40} = entre 4 y 40 veces
        //   $ = fin del texto
        if (nombreApellidos === "") {
            errores.push("El nombre y apellidos es obligatorio.");
        } else if (!/^[\w ]{4,40}$/.test(nombreApellidos)) {
            // "/regex/.test(texto)" devuelve true si el texto cumple la regex
            // "!" delante lo niega: si NO cumple la regex
            errores.push("El nombre y apellidos debe tener entre 4 y 40 caracteres.");
        }

        // Validación 2: DNI, CIF o NIA
        // Tres formatos posibles:
        //   DNI: 9 dígitos + 1 letra mayúscula    → \d{9}[A-Z]
        //   CIF: 1 letra mayúscula + 8 dígitos    → [A-Z]\d{8}
        //   NIA: X + 7 dígitos + 1 letra mayúscula → X\d{7}[A-Z]
        // El "|" en regex = OR (cumple uno u otro)
        let regexDni = /^(\d{9}[A-Z])|([A-Z]\d{8})|(X\d{7}[A-Z])$/;
        if (dniCifNia === "") {
            errores.push("El DNI, CIF o NIA es obligatorio.");
        } else if (!regexDni.test(dniCifNia)) {
            errores.push("El DNI/CIF/NIA no tiene un formato válido. Ejemplos: 12345678A (DNI), A12345678 (CIF), X1234567W (NIA).");
        }

        // Validación 3: Email
        // Regex de email: formato correcto, dominio puede tener más de 4 caracteres
        let regexEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (email === "") {
            errores.push("El email es obligatorio.");
        } else if (!regexEmail.test(email)) {
            errores.push("El email no tiene un formato válido. Ejemplo: usuario@dominio.com");
        }

        // Validación 4: Teléfono
        // Formato: (999) 666-333
        //   \( = paréntesis abierto literal (hay que escaparlo con \)
        //   \d{3} = exactamente 3 dígitos
        //   \) = paréntesis cerrado literal
        //   \s = espacio
        //   \d{3} = 3 dígitos
        //   - = guión literal
        //   \d{3} = 3 dígitos
        let regexTelefono = /^\(\d{3}\)\s\d{3}-\d{3}$/;
        if (telefono === "") {
            errores.push("El teléfono es obligatorio.");
        } else if (!regexTelefono.test(telefono)) {
            errores.push("El teléfono debe tener el formato (999) 666-333.");
        }

        // Validación 5: Checkbox "Aceptar condiciones"
        if (!aceptar) {
            errores.push("Debes aceptar las condiciones de uso del sitio.");
        }

        // --- MOSTRAR ERRORES O GUARDAR (Criterio 13: mensajes unificados) ---

        if (errores.length > 0) {
            // Hay errores: los juntamos todos en un solo mensaje
            // ".join(" | ")" une todos los elementos del array con ese separador
            document.getElementById("errorMensaje").textContent = errores.join(" | ");
            return; // Salimos sin guardar
        }

        // --- Si llegamos aquí, todos los datos son correctos ---

        // CRITERIO 15: Guardar en localStorage con formato JSON
        // Construimos el objeto de reserva con la estructura indicada en el examen
        let reserva = {
            coche: coche,      // El objeto coche completo
            cliente: {
                nombreApellidos: nombreApellidos,
                dniCifNia: dniCifNia,
                email: email,
                telefono: telefono,
                nota: nota
            }
        };

        // Guardamos en localStorage (permanente, no se borra al cerrar)
        // "JSON.stringify(objeto)" convierte el objeto a texto para poder guardarlo
        localStorage.setItem("reserva", JSON.stringify(reserva));

        // CRITERIO 16: Redirigir al inicio
        window.location.href = "index.html";
    });

}); // ← Cierre del DOMContentLoaded