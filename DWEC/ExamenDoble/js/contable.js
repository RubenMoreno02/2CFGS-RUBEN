document.addEventListener("DOMContentLoaded", main);

function main() {
    cargarApuntes();           // Lee localStorage, pinta tabla y calcula saldo
    configurarFormulario();    // Validación y guardado de nuevo apunte
    asignarEliminacion();      // Evento para eliminar apuntes (usando delegación)
}

// -------------------------------------------------------
// OBTENER APUNTES DEL LOCALSTORAGE
// -------------------------------------------------------
function obtenerApuntes() {
    const datos = localStorage.getItem("apuntes");
    return datos ? JSON.parse(datos) : []; // si no hay nada, array vacío
}

// -------------------------------------------------------
// GUARDAR APUNTES EN LOCALSTORAGE
// -------------------------------------------------------
function guardarApuntes(apuntes) {
    localStorage.setItem("apuntes", JSON.stringify(apuntes));
}

// -------------------------------------------------------
// CARGAR LA TABLA Y CALCULAR SALDO
// -------------------------------------------------------
function cargarApuntes() {
    const apuntes = obtenerApuntes();
    const tbody = document.querySelector("#tablaApuntes tbody");
    tbody.innerHTML = "";

    let saldo = 0;

    apuntes.forEach((apunte, indice) => {
        // Convertimos el importe a número por si acaso
        const importe = parseFloat(apunte.importe);

        // Actualizamos el saldo: sumamos si HABER, restamos si DEBE
        if (apunte.tipo === "H") {
            saldo += importe;
        } else {
            saldo -= importe;
        }

        // Creamos una fila
        const fila = document.createElement("tr");

        // Fecha
        const tdFecha = document.createElement("td");
        tdFecha.textContent = apunte.fecha;
        fila.appendChild(tdFecha);

        // Concepto
        const tdConcepto = document.createElement("td");
        tdConcepto.textContent = apunte.concepto;
        fila.appendChild(tdConcepto);

        // Tipo
        const tdTipo = document.createElement("td");
        tdTipo.textContent = apunte.tipo === "D" ? "DEBE" : "HABER";
        fila.appendChild(tdTipo);

        // Importe (con dos decimales)
        const tdImporte = document.createElement("td");
        tdImporte.textContent = importe.toFixed(2) + " €";
        fila.appendChild(tdImporte);

        // Acción (botón eliminar)
        const tdAccion = document.createElement("td");
        const btnEliminar = document.createElement("button");
        btnEliminar.className = "btn btn-danger btn-sm";
        btnEliminar.textContent = "Eliminar";
        btnEliminar.dataset.indice = indice; // guardamos el índice para identificar
        tdAccion.appendChild(btnEliminar);
        fila.appendChild(tdAccion);

        tbody.appendChild(fila);
    });

    // Mostramos el saldo con dos decimales
    document.getElementById("saldoActual").textContent = saldo.toFixed(2);
}

// -------------------------------------------------------
// CONFIGURAR EL FORMULARIO DE NUEVO APUNTE
// -------------------------------------------------------
function configurarFormulario() {
    const formulario = document.getElementById("formApunte");

    formulario.addEventListener("submit", function(e) {
        e.preventDefault();

        // Recogemos los valores
        const fecha = document.getElementById("fecha").value;
        const concepto = document.getElementById("concepto").value.trim();
        const tipoRadios = document.getElementsByName("tipo");
        let tipo = "";
        for (const radio of tipoRadios) {
            if (radio.checked) {
                tipo = radio.value;
                break;
            }
        }
        const importe = document.getElementById("importe").value.trim();

        // ---- VALIDACIONES simples con alert (como el examen antiguo) ----
        if (!fecha) {
            alert("La fecha no puede estar vacía.");
            return;
        }
        if (concepto === "") {
            alert("El concepto no puede estar vacío.");
            return;
        }
        if (tipo === "") {
            alert("Debe seleccionar DEBE o HABER.");
            return;
        }
        const importeNum = parseFloat(importe);
        if (isNaN(importeNum) || importeNum <= 0) {
            alert("El importe debe ser un número positivo mayor que cero.");
            return;
        }

        // Crear el objeto apunte
        const nuevoApunte = {
            fecha: fecha,
            concepto: concepto,
            tipo: tipo,        // "D" o "H"
            importe: importeNum.toString() // guardamos como string para mantener formato
        };

        // Añadir al array existente y guardar
        const apuntes = obtenerApuntes();
        apuntes.push(nuevoApunte);
        guardarApuntes(apuntes);

        // Limpiar formulario
        formulario.reset();

        // Recargar la tabla y el saldo
        cargarApuntes();
    });
}

// -------------------------------------------------------
// DELEGACIÓN DE EVENTOS PARA ELIMINAR APUNTES
// -------------------------------------------------------
function asignarEliminacion() {
    // Delegamos el evento click sobre el tbody para los botones Eliminar
    document.querySelector("#tablaApuntes tbody").addEventListener("click", function(e) {
        if (e.target.classList.contains("btn-danger")) {
            const indice = e.target.dataset.indice; // leemos el índice guardado
            if (confirm("¿Está seguro de eliminar este apunte?")) {
                let apuntes = obtenerApuntes();
                apuntes.splice(indice, 1); // quitamos el elemento
                guardarApuntes(apuntes);
                cargarApuntes(); // recargamos tabla y saldo
            }
        }
    });
}