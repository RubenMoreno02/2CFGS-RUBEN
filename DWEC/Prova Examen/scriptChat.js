/**
 * LIBRO CONTABLE - script.js
 * Stack: Vanilla JS puro
 * Datos iniciales: datos.json  →  fetch
 * Persistencia:    localStorage bajo la clave 'apuntes'
 *
 * RESTRICCIONES:
 *  - Sin innerHTML (ni para limpiar)
 *  - Sin textContent directo → createTextNode()
 *  - Solo createElement + classList.add + appendChild
 *  - Limpiar con limpiarNodos()
 *  - Sin onclick en el HTML, todos los eventos en JS
 */

document.addEventListener('DOMContentLoaded', main);

// ─── Variable global de ordenación ────────────────────────────────────────────
var ordenAsc = true;

// ─── MAIN ─────────────────────────────────────────────────────────────────────

function main() {

    // Cargar datos: localStorage → si vacío, fetch datos.json
    fetch('datos.json')
        .then(function(response) { return response.json(); })
        .then(function(json) {
            if (!localStorage.getItem('apuntes')) {
                setApuntes(json.apuntes);
            }
            pintarTodos(getApuntes());
        })
        .catch(function(err) {
            console.error('Error cargando datos.json:', err);
            pintarTodos(getApuntes());
        });

    // Evento botón Grabar
    document.getElementById('btnGrabar').addEventListener('click', grabarApunte);

    // Evento delegado para los botones Borrar (están dentro de cuerpoTabla)
    document.getElementById('cuerpoTabla').addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-borrar')) {
            var indice = parseInt(e.target.dataset.indice, 10);
            borrarApunte(indice);
        }
    });

    // Eventos botones de ordenación
    document.getElementById('btnSortAsc').addEventListener('click', function() {
        ordenAsc = true;
        document.getElementById('btnSortAsc').classList.add('actiu');
        document.getElementById('btnSortDesc').classList.remove('actiu');
        pintarTodos(getApuntes());
    });

    document.getElementById('btnSortDesc').addEventListener('click', function() {
        ordenAsc = false;
        document.getElementById('btnSortDesc').classList.add('actiu');
        document.getElementById('btnSortAsc').classList.remove('actiu');
        pintarTodos(getApuntes());
    });
}

// ─── UTILIDADES ───────────────────────────────────────────────────────────────

// Vacía todos los nodos hijo de un elemento sin usar innerHTML
function limpiarNodos(elemento) {
    while (elemento.firstChild) {
        elemento.removeChild(elemento.firstChild);
    }
}

// Convierte fecha DD/MM/YYYY a objeto Date (para poder ordenar)
function fechaADate(str) {
    var partes = str.split('/');
    return new Date(partes[2], partes[1] - 1, partes[0]);
}

// ─── BLOQUE 1: Pintar todos los apuntes ───────────────────────────────────────

function pintarTodos(apuntes) {
    var cuerpo = document.getElementById('cuerpoTabla');
    limpiarNodos(cuerpo);

    // Ordenar por fecha según el estado actual
    var lista = apuntes.slice(); // copia para no modificar el original
    lista.sort(function(a, b) {
        var da = fechaADate(a.fecha);
        var db = fechaADate(b.fecha);
        if (da < db) return ordenAsc ? -1 : 1;
        if (da > db) return ordenAsc ?  1 : -1;
        return 0;
    });

    // Calcular saldos sobre la lista ordenada
    var saldoAcumulado = 0;
    lista.forEach(function(apunte, indice) {
        if (apunte.dh === 'H') {
            saldoAcumulado += apunte.importe;
        } else {
            saldoAcumulado -= apunte.importe;
        }
        saldoAcumulado = Math.round(saldoAcumulado * 100) / 100;

        // El índice real en localStorage (array sin ordenar) lo buscamos por posición
        var indiceReal = apuntes.indexOf(apunte);
        var fila = crearFila(apunte, saldoAcumulado, indiceReal);
        cuerpo.appendChild(fila);
    });

    // Actualizar saldo total y contador
    var saldoEl = document.getElementById('saldoActual');
    limpiarNodos(saldoEl);
    saldoEl.appendChild(document.createTextNode(saldoAcumulado.toFixed(2)));

    var comptador = document.getElementById('comptador');
    limpiarNodos(comptador);
    comptador.appendChild(document.createTextNode(apuntes.length + ' registres'));
}

// ─── BLOQUE 1b: Crear una fila ────────────────────────────────────────────────

function crearFila(apunte, saldo, indice) {
    var tr = document.createElement('tr');

    // — Borrar —
    var tdBtn = document.createElement('td');
    var btn   = document.createElement('button');
    btn.classList.add('btn', 'btn-sm', 'btn-danger', 'btn-borrar');
    btn.dataset.indice = indice;
    btn.appendChild(document.createTextNode('Borrar'));
    tdBtn.appendChild(btn);
    tr.appendChild(tdBtn);

    // — Fecha —
    var tdFecha = document.createElement('td');
    tdFecha.appendChild(document.createTextNode(apunte.fecha));
    tr.appendChild(tdFecha);

    // — Concepto —
    var tdConcepto = document.createElement('td');
    tdConcepto.appendChild(document.createTextNode(apunte.concepto));
    tr.appendChild(tdConcepto);

    // — D/H —
    var tdDh  = document.createElement('td');
    tdDh.classList.add('text-center');
    var span  = document.createElement('span');
    span.classList.add(apunte.dh === 'H' ? 'badge-h' : 'badge-d');
    span.appendChild(document.createTextNode(apunte.dh));
    tdDh.appendChild(span);
    tr.appendChild(tdDh);

    // — Importe —
    var tdImporte = document.createElement('td');
    tdImporte.classList.add('text-end');
    tdImporte.appendChild(document.createTextNode(apunte.importe.toFixed(2)));
    tr.appendChild(tdImporte);

    // — Saldo —
    var tdSaldo = document.createElement('td');
    tdSaldo.classList.add('text-end', 'fw-bold');
    tdSaldo.classList.add(saldo > 0 ? 'text-success' : saldo < 0 ? 'text-danger' : 'text-secondary');
    tdSaldo.appendChild(document.createTextNode(saldo.toFixed(2)));
    tr.appendChild(tdSaldo);

    return tr;
}

// ─── BLOQUE 2: Validaciones ───────────────────────────────────────────────────

function validarFecha(fecha) {
    // El input type="date" devuelve YYYY-MM-DD, comprobamos que no esté vacío
    if (fecha === '') return false;
    var d = new Date(fecha);
    return !isNaN(d.getTime());
}

function validarConcepto(concepto) {
    return concepto.trim().length > 0;
}

function validarDH(dh) {
    return dh === 'D' || dh === 'H';
}

function validarImporte(importe) {
    var valor = parseFloat(importe);
    return !isNaN(valor) && valor > 0;
}

// ─── BLOQUE 3: Grabar apunte ──────────────────────────────────────────────────

function grabarApunte() {
    var fecha    = document.getElementById('inpFecha').value;
    var concepto = document.getElementById('inpConcepto').value.trim();
    var dh       = document.getElementById('inpDH').value;
    var importe  = document.getElementById('inpImporte').value;

    if (!validarFecha(fecha)) {
        alert('Error: La fecha no es correcta.');
        return;
    }
    if (!validarConcepto(concepto)) {
        alert('Error: El concepto no puede estar vacío.');
        return;
    }
    if (!validarDH(dh)) {
        alert('Error: Debes seleccionar D (Debe) o H (Haber).');
        return;
    }
    if (!validarImporte(importe)) {
        alert('Error: El importe debe ser un número mayor que 0.');
        return;
    }

    // Convertir fecha de YYYY-MM-DD a DD/MM/YYYY para guardar igual que datos.json
    var partes     = fecha.split('-');
    var fechaGuard = partes[2] + '/' + partes[1] + '/' + partes[0];

    var nuevoApunte = {
        fecha:    fechaGuard,
        concepto: concepto,
        dh:       dh,
        importe:  parseFloat(importe)
    };

    var apuntes = getApuntes();
    apuntes.push(nuevoApunte);
    setApuntes(apuntes);
    pintarTodos(apuntes);

    // Limpiar formulario
    document.getElementById('inpFecha').value   = '';
    document.getElementById('inpConcepto').value = '';
    document.getElementById('inpDH').value      = '';
    document.getElementById('inpImporte').value  = '';
}

// ─── BLOQUE 5: Borrar apunte ──────────────────────────────────────────────────

function borrarApunte(indice) {
    var confirmado = confirm('¿Seguro que quieres eliminar este apunte?');
    if (!confirmado) return;

    var apuntes = getApuntes();
    apuntes.splice(indice, 1);
    setApuntes(apuntes);
    pintarTodos(apuntes);
}

// ─── LOCALSTORAGE ─────────────────────────────────────────────────────────────

function getApuntes() {
    try {
        return JSON.parse(localStorage.getItem('apuntes')) || [];
    } catch (e) {
        localStorage.removeItem('apuntes');
        return [];
    }
}

function setApuntes(apuntes) {
    localStorage.setItem('apuntes', JSON.stringify(apuntes));
}