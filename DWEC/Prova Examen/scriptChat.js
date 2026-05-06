// script.js - Libro Contable
// Alumne: ...
// Curs: 2CFGS DWEC

// ---------------------------------------------------
// OBJETO para guardar un apunte
// ---------------------------------------------------
function crearApunt(fecha, concepto, dh, importe) {
    var apunt = {
        id: Date.now(),         // usamos timestamp como id único
        fecha: fecha,
        concepto: concepto,
        dh: dh,
        importe: parseFloat(importe)
    };
    return apunt;
}

// ---------------------------------------------------
// VARIABLES GLOBALES
// ---------------------------------------------------
var listaApunts = [];       // array con todos los apuntes
var ordenAsc = true;        // true = ascendente, false = descendente

// ---------------------------------------------------
// LOCALSTORAGE - guardar
// ---------------------------------------------------
function guardarEnLocalStorage() {
    localStorage.setItem("apunts", JSON.stringify(listaApunts));
}

// ---------------------------------------------------
// CARGAR DATOS
// Si el localStorage tiene datos → los usamos
// Si está vacío → cargamos el fichero datos.json
// ---------------------------------------------------
function cargarDatos() {
    var datosGuardados = localStorage.getItem("apunts");

    if (datosGuardados != null) {
        // Ya hay datos en localStorage, los usamos directamente
        listaApunts = JSON.parse(datosGuardados);
        mostrarTabla();
    } else {
        // No hay datos guardados, cargamos el JSON inicial
        cargarDesdeJSON();
    }
}

function cargarDesdeJSON() {
    // fetch lee el fichero datos.json de forma asíncrona
    fetch("datos.json")
        .then(function(respuesta) {
            return respuesta.json();
        })
        .then(function(datos) {
            // Guardamos los datos del JSON en nuestra lista y en localStorage
            listaApunts = datos;
            guardarEnLocalStorage();
            mostrarTabla();
        })
        .catch(function(error) {
            // Si no puede leer el fichero (p.ej. sin servidor), arrancamos vacío
            console.log("No se pudo cargar datos.json:", error);
            listaApunts = [];
            mostrarTabla();
        });
}

// ---------------------------------------------------
// CALCULAR SALDO ACUMULADO
// Los apuntes H suman, los D restan
// Devuelve un objeto con { id: saldoAcumulado }
// ---------------------------------------------------
function calcularSaldos() {
    // Para calcular bien, siempre ordenamos por fecha de menor a mayor
    var ordenados = listaApunts.slice();
    ordenados.sort(function(a, b) {
        if (a.fecha < b.fecha) return -1;
        if (a.fecha > b.fecha) return 1;
        return 0;
    });

    var saldo = 0;
    var saldos = {};

    for (var i = 0; i < ordenados.length; i++) {
        var a = ordenados[i];
        if (a.dh == "H") {
            saldo = saldo + a.importe;
        } else {
            saldo = saldo - a.importe;
        }
        saldos[a.id] = Math.round(saldo * 100) / 100;
    }

    return saldos;
}

// ---------------------------------------------------
// FORMATEAR FECHA de YYYY-MM-DD a DD/MM/YYYY
// ---------------------------------------------------
function formatearFecha(fecha) {
    var partes = fecha.split("-");
    return partes[2] + "/" + partes[1] + "/" + partes[0];
}

// ---------------------------------------------------
// MOSTRAR / RENDERIZAR LA TABLA
// ---------------------------------------------------
function mostrarTabla() {
    var tbody        = document.getElementById("tbodyApunts");
    var saldoTotalEl = document.getElementById("saldoTotal");
    var comptador    = document.getElementById("comptador");

    var saldos = calcularSaldos();

    // Ordenar lista según el orden actual
    var lista = listaApunts.slice();
    lista.sort(function(a, b) {
        if (a.fecha < b.fecha) return ordenAsc ? -1 : 1;
        if (a.fecha > b.fecha) return ordenAsc ? 1 : -1;
        return 0;
    });

    tbody.innerHTML = "";

    if (lista.length == 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted fst-italic">No hay apuntes todavía.</td></tr>';
        saldoTotalEl.textContent = "0.00";
        saldoTotalEl.className   = "text-end fw-bold saldo-zero";
        comptador.textContent    = "0 registres";
        return;
    }

    comptador.textContent = lista.length + " registres";

    for (var i = 0; i < lista.length; i++) {
        var ap      = lista[i];
        var saldoAp = saldos[ap.id];

        var clsSaldo = "saldo-zero";
        if (saldoAp > 0) clsSaldo = "saldo-pos";
        if (saldoAp < 0) clsSaldo = "saldo-neg";

        var badgeDH = '<span class="badge-' + ap.dh.toLowerCase() + '">' + ap.dh + '</span>';

        var fila = '<tr>';
        fila += '<td><button class="btn btn-sm btn-danger" onclick="borrarApunt(' + ap.id + ')">Borrar</button></td>';
        fila += '<td>' + formatearFecha(ap.fecha) + '</td>';
        fila += '<td>' + ap.concepto + '</td>';
        fila += '<td class="text-center">' + badgeDH + '</td>';
        fila += '<td class="text-end">' + ap.importe.toFixed(2) + '</td>';
        fila += '<td class="text-end"><span class="' + clsSaldo + '">' + saldoAp.toFixed(2) + '</span></td>';
        fila += '</tr>';

        tbody.innerHTML += fila;
    }

    // Saldo final = último valor del mapa (en orden cronológico)
    var ids        = Object.keys(saldos);
    var saldoFinal = saldos[ids[ids.length - 1]];

    saldoTotalEl.textContent = saldoFinal.toFixed(2);
    saldoTotalEl.className   = "text-end fw-bold ";
    if (saldoFinal > 0)      saldoTotalEl.className += "saldo-pos";
    else if (saldoFinal < 0) saldoTotalEl.className += "saldo-neg";
    else                     saldoTotalEl.className += "saldo-zero";
}

// ---------------------------------------------------
// VALIDAR el formulario
// ---------------------------------------------------
function validarFormulario() {
    var fecha    = document.getElementById("inpFecha").value;
    var concepto = document.getElementById("inpConcepto").value.trim();
    var dh       = document.getElementById("inpDH").value;
    var importe  = document.getElementById("inpImporte").value;

    if (fecha == "") {
        alert("Error: La fecha es obligatoria.\nFormato: dd/mm/aaaa");
        return false;
    }

    var fechaObj = new Date(fecha);
    if (isNaN(fechaObj.getTime())) {
        alert("Error: La fecha no es válida.");
        return false;
    }

    if (concepto == "") {
        alert("Error: El concepto no puede estar vacío.");
        return false;
    }

    if (dh != "D" && dh != "H") {
        alert("Error: Debes seleccionar D (Debe) o H (Haber).");
        return false;
    }

    if (importe == "" || isNaN(importe) || parseFloat(importe) <= 0) {
        alert("Error: El importe debe ser un número mayor que 0.");
        return false;
    }

    return true;
}

// ---------------------------------------------------
// GRABAR un nuevo apunte
// ---------------------------------------------------
function grabarApunt() {
    if (!validarFormulario()) return;

    var fecha    = document.getElementById("inpFecha").value;
    var concepto = document.getElementById("inpConcepto").value.trim();
    var dh       = document.getElementById("inpDH").value;
    var importe  = document.getElementById("inpImporte").value;

    var nuevoApunt = crearApunt(fecha, concepto, dh, importe);

    listaApunts.push(nuevoApunt);
    guardarEnLocalStorage();
    mostrarTabla();

    // Limpiar formulario
    document.getElementById("inpFecha").value    = "";
    document.getElementById("inpConcepto").value = "";
    document.getElementById("inpDH").value       = "";
    document.getElementById("inpImporte").value  = "";
}

// ---------------------------------------------------
// BORRAR un apunte por id
// ---------------------------------------------------
function borrarApunt(id) {
    var apunt = null;
    for (var i = 0; i < listaApunts.length; i++) {
        if (listaApunts[i].id == id) {
            apunt = listaApunts[i];
            break;
        }
    }

    if (apunt == null) return;

    var ok = confirm(
        "¿Seguro que quieres borrar este apunte?\n\n" +
        "Fecha: "   + formatearFecha(apunt.fecha)        + "\n" +
        "Concepto: "+ apunt.concepto                     + "\n" +
        "Importe: " + apunt.importe.toFixed(2)           + " €"
    );

    if (!ok) return;

    var nuevaLista = [];
    for (var i = 0; i < listaApunts.length; i++) {
        if (listaApunts[i].id != id) {
            nuevaLista.push(listaApunts[i]);
        }
    }
    listaApunts = nuevaLista;

    guardarEnLocalStorage();
    mostrarTabla();
}

// ---------------------------------------------------
// ORDENACIÓN - botones Asc / Desc
// ---------------------------------------------------
function configurarBotonesOrden() {
    var btnAsc  = document.getElementById("btnSortAsc");
    var btnDesc = document.getElementById("btnSortDesc");

    btnAsc.addEventListener("click", function() {
        ordenAsc = true;
        btnAsc.classList.add("actiu");
        btnDesc.classList.remove("actiu");
        mostrarTabla();
    });

    btnDesc.addEventListener("click", function() {
        ordenAsc = false;
        btnDesc.classList.add("actiu");
        btnAsc.classList.remove("actiu");
        mostrarTabla();
    });
}

// ---------------------------------------------------
// INICIO - cuando carga la página
// ---------------------------------------------------
window.addEventListener("load", function() {
    cargarDatos();
    document.getElementById("btnGrabar").addEventListener("click", grabarApunt);
    configurarBotonesOrden();
});