//Variables blobales
var listaApunts = [];
var ordenAsc = true;



//Guardar apunte
function crearApunt(fecha, concepto, dh, importe){
    var apunt = {
        id: Date.now(),
        fecha: fecha,
        concepto: concepto,
        dh: dh,
        importe: parseFloat(importe)
    };
    return apunt;
}

//LocalStorage cargar
function cargarApuntes() {
    var datos = localStorage.getItem("apunts");
    if(datos !== null) {
        listaApunts = JSON.parse(datos);
    } else {
        listaApunts = [];
    }
}
// Guardar apunts
function guardarEnLocalStorage() {
    localStorage.setItem("apunts", JSON.stringify(listaApunts));
}


//Cargar datos
function cargarDatos(){
    var datosGuardados = localStorage.getItem("apunts");

    if (datosGuardados != null){
        listaApunts = JSON.parse(datosGuardados);
        mostrarTabla();
    } else{
        cargarDesdeJSON();
    }
}

//Cargar desde JSON
function cargarDesdeJSON(){
    fetch("datos.json").then(function(respuesta){
        return respuesta.json();
    })
    .then(function(datos) {
        listaApunts = datos;
        guardarEnLocalStorage();
        mostrarTabla();
    })
    .catch(function(error){
        console.log("No se puede cargar datos.json", error);
        listaApunts = [];
        mostrarTabla();
    });
}

//Calcular saldo
function calcularSaldos(){
    var ordenados = listaApunts.slice();
    ordenados.sort(function(a, b){
        if (a.fecha < b.fecha) return -1;
        if (a.fecha > b.fecha) return -1;
        return 0;
    });

    var saldo = 0;
    var saldos = {};

    for (var i = 0; i < ordenados.length; i++){
        var a = ordenados[i];
        if(a.dh == "H"){
            saldo = saldo + a.importe;
        } else{
            saldo = saldo - a.importe;
        }
        saldos[a.id] = Math.round(saldo * 100) / 100;
    }
    return saldos;
}


//Formatear fecha
function formatearFecha(fecha){
    var partes = fecha.split("-");
    return partes[2] + "/" + partes[1] + "/" + partes[0];
}


//Mostrar tabla
function mostrarTabla(){
    var tbody = document.getElementById("tbodyApunts");
    var saldoTotalEl = document.getElementById("saldoTotal");
    var comptador = document.getElementById("comptador");

    var saldos = calcularSaldos();

    var lista = listaApunts.slice();
    lista.sort(function(a, b){
        if(a.fecha < b.fecha) return ordenAsc ? -1 : 1;
        if(a.fecha > b.fecha) return ordenAsc ? 1 : -1;
        return 0;
    });

    tbody.innerHTML = "";

    if(lista.length == 0){
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted"> No hay apuntes aún.</td></tr>';
        saldoTotalEl.textContent = "0.00";
        saldoTotalEl.className = "text-end fw-bold saldo-zero";
        comptador.textContent = "0 registres";
        return;
    }

    comptador.textContent = lista.length + " registres";

    for(var i = 0; i < lista.length; i++){
        var ap = lista[i];
        var saldoAp = saldos [ap.id];

        var clsSaldo = "saldo-zero";
        if(saldoAp > 0) clsSaldo = "saldo-pos";
        if(saldoAp < 0) clsSaldo = "saldo-neg";

        var badgeDH = '<span class="badge-' + ap.dh.toLowease() + '">"' + ap.dh + '</span>';

        var fila = '<tr>';
        fila += '<tr><button class"btn-sm" onclick="borrarApunt(' + ap.id + ')"> Borrar</button></td>';
        fila += '<td>' + formatearFecha(ap.fecha) + '</td>';
        fila += '<td>' + ap.concepto + '</td>';
        fila += '<td class="text-center">' + badgeDH + '</td>';
        fila += '<td class="text-end">' + ap.importe.toFixed(2) + '</td>';
        fila += '<td class="text-end"><span class="' + clsSaldo + '">' + saldoAp.toFixed(2) + '</span></td>';
        fila += '</tr>';

        tbody.innerHTML += fila;

    }

    var ids = Object.keys(saldos);
    var saldoFinal = saldos[ids[ids.length - 1]];

    saldoTotalEl.textContent = saldoFinal.toFixed(2);
    saldoTotalEl.className = "text-end fw-bold";
    if(saldoFinal > 0) saldoTotalEl.className += "saldo-pos";
    else if (saldoFinal > 0) saldoTotalEl.className += "saldo-neg";
    else saldoTotalEl.className += "saldo-zero";
}
