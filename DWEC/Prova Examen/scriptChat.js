/**
 * LIBRO CONTABLE - script.js
 * Stack: Vanilla JS puro
 * Datos iniciales: datos.json (cargado via fetch)
 * Persistencia: localStorage bajo la clave 'apuntes' (array JSON)
 *
 * RESTRICCIONES DE EXAMEN:
 *  - Sin innerHTML (ni para limpiar)
 *  - Sin textContent → usar createTextNode()
 *  - Solo createElement + classList.add + appendChild
 *  - Limpiar con limpiarNodos()
 */

document.addEventListener('DOMContentLoaded', main);

function main() {

    // ─── BLOQUE 1: Carga inicial ───────────────────────────────────────────────
    // fetch del JSON (requiere servidor local tipo Live Server)
    fetch('datos.json')
        .then(response => response.json())
        .then(json => {
            if (!localStorage.getItem('apuntes')) {
                setApuntes(json.apuntes);
            }
            pintarTodos(getApuntes());
        })
        .catch(err => console.error('Error cargando datos.json:', err));

    // ─── BLOQUE 2-3: Evento botón Grabar ──────────────────────────────────────
    document.getElementById('btnGrabar').addEventListener('click', grabarApunte);

    // ─── BLOQUE 5: Evento delegado para botones Borrar ────────────────────────
    document.getElementById('cuerpoTabla').addEventListener('click', function (e) {
        if (e.target.classList.contains('btn-borrar')) {
            const indice = parseInt(e.target.dataset.indice, 10);
            borrarApunte(indice);
        }
    });

    // ─── EXTRA: Ordenación por fecha ──────────────────────────────────────────
    document.getElementById('btnSortAsc').addEventListener('click', function () {
        document.getElementById('btnSortAsc').classList.add('actiu');
        document.getElementById('btnSortDesc').classList.remove('actiu');
        const apuntes = getApuntes().sort((a, b) => compararFechas(a.fecha, b.fecha));
        setApuntes(apuntes);
        pintarTodos(apuntes);
    });

    document.getElementById('btnSortDesc').addEventListener('click', function () {
        document.getElementById('btnSortDesc').classList.add('actiu');
        document.getElementById('btnSortAsc').classList.remove('actiu');
        const apuntes = getApuntes().sort((a, b) => compararFechas(b.fecha, a.fecha));
        setApuntes(apuntes);
        pintarTodos(apuntes);
    });
}

// ─── UTILIDADES ───────────────────────────────────────────────────────────────

function limpiarNodos(elemento) {
    while (elemento.firstChild) {
        elemento.removeChild(elemento.firstChild);
    }
}

// Convierte "dd/mm/aaaa" a objeto Date para poder comparar
function fechaADate(fechaStr) {
    const partes = fechaStr.split('/');
    return new Date(parseInt(partes[2], 10), parseInt(partes[1], 10) - 1, parseInt(partes[0], 10));
}

function compararFechas(fechaA, fechaB) {
    return fechaADate(fechaA) - fechaADate(fechaB);
}

// ─── BLOQUE 1: Pintar todos los apuntes ───────────────────────────────────────

function pintarTodos(apuntes) {
    const cuerpo = document.getElementById('cuerpoTabla');
    limpiarNodos(cuerpo);

    let saldoAcumulado = 0;

    apuntes.forEach(function (apunte, indice) {
        if (apunte.dh === 'H') {
            saldoAcumulado += apunte.importe;
        } else {
            saldoAcumulado -= apunte.importe;
        }

        const fila = crearFila(apunte, saldoAcumulado, indice);
        cuerpo.appendChild(fila);
    });

    // Actualizar saldo total en la celda del formulario
    const saldoEl = document.getElementById('saldoActual');
    limpiarNodos(saldoEl);
    saldoEl.appendChild(document.createTextNode(saldoAcumulado.toFixed(2)));

    // Actualizar contador de registres
    const comptador = document.getElementById('comptador');
    limpiarNodos(comptador);
    comptador.appendChild(document.createTextNode(apuntes.length + ' registres'));
}

function crearFila(apunte, saldo, indice) {
    const tr = document.createElement('tr');

    // ── Borrar ──
    const tdBtn = document.createElement('td');
    const btn = document.createElement('button');
    btn.classList.add('btn');
    btn.classList.add('btn-sm');
    btn.classList.add('btn-danger');
    btn.classList.add('btn-borrar');
    btn.dataset.indice = indice;
    btn.appendChild(document.createTextNode('Borrar'));
    tdBtn.appendChild(btn);
    tr.appendChild(tdBtn);

    // ── Fecha ──
    const tdFecha = document.createElement('td');
    tdFecha.appendChild(document.createTextNode(apunte.fecha));
    tr.appendChild(tdFecha);

    // ── Concepto ──
    const tdConcepto = document.createElement('td');
    tdConcepto.appendChild(document.createTextNode(apunte.concepto));
    tr.appendChild(tdConcepto);

    // ── D/H ──
    const tdDh = document.createElement('td');
    tdDh.classList.add('text-center');
    const spanDh = document.createElement('span');
    spanDh.classList.add('badge-' + apunte.dh.toLowerCase());
    spanDh.appendChild(document.createTextNode(apunte.dh));
    tdDh.appendChild(spanDh);
    tr.appendChild(tdDh);

    // ── Importe ──
    const tdImporte = document.createElement('td');
    tdImporte.classList.add('text-end');
    tdImporte.appendChild(document.createTextNode(apunte.importe.toFixed(2)));
    tr.appendChild(tdImporte);

    // ── Saldo ──
    const tdSaldo = document.createElement('td');
    tdSaldo.classList.add('text-end');
    tdSaldo.classList.add('fw-bold');
    if (saldo > 0) tdSaldo.classList.add('saldo-pos');
    else if (saldo < 0) tdSaldo.classList.add('saldo-neg');
    else tdSaldo.classList.add('saldo-zero');
    tdSaldo.appendChild(document.createTextNode(saldo.toFixed(2)));
    tr.appendChild(tdSaldo);

    return tr;
}

// ─── BLOQUE 2: Validaciones ───────────────────────────────────────────────────

function validarFecha(fecha) {
    // El input type="date" devuelve YYYY-MM-DD, lo convertimos a dd/mm/aaaa para validar
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(fecha)) return false;

    const partes = fecha.split('-');
    const anyo = parseInt(partes[0], 10);
    const mes  = parseInt(partes[1], 10) - 1;
    const dia  = parseInt(partes[2], 10);

    const d = new Date(anyo, mes, dia);
    return d.getFullYear() === anyo && d.getMonth() === mes && d.getDate() === dia;
}

function validarConcepto(concepto) {
    return concepto.trim().length > 0;
}

function validarDH(dh) {
    return dh === 'D' || dh === 'H';
}

function validarImporte(importe) {
    const valor = parseFloat(importe);
    return !isNaN(valor) && valor > 0;
}

// ─── BLOQUE 3: Grabar apunte ──────────────────────────────────────────────────

function grabarApunte() {
    const fechaRaw  = document.getElementById('inpFecha').value.trim();
    const concepto  = document.getElementById('inpConcepto').value.trim();
    const dh        = document.getElementById('inpDH').value;
    const importe   = document.getElementById('inpImporte').value;

    if (!validarFecha(fechaRaw)) {
        alert('La fecha no es correcta.');
        return;
    }
    if (!validarConcepto(concepto)) {
        alert('El concepto no puede estar vacío.');
        return;
    }
    if (!validarDH(dh)) {
        alert('Debes seleccionar D (Debe) o H (Haber).');
        return;
    }
    if (!validarImporte(importe)) {
        alert('El importe debe ser un número mayor que 0.');
        return;
    }

    // Convertir fecha de YYYY-MM-DD a dd/mm/aaaa para guardar igual que el JSON
    const partes = fechaRaw.split('-');
    const fechaFormateada = partes[2] + '/' + partes[1] + '/' + partes[0];

    const nuevoApunte = {
        fecha:    fechaFormateada,
        concepto: concepto,
        dh:       dh,
        importe:  parseFloat(importe)
    };

    const apuntes = getApuntes();
    apuntes.push(nuevoApunte);
    setApuntes(apuntes);
    pintarTodos(apuntes);

    // Limpiar formulario
    document.getElementById('inpFecha').value   = '';
    document.getElementById('inpConcepto').value = '';
    document.getElementById('inpDH').value       = '';
    document.getElementById('inpImporte').value  = '';
}

// ─── BLOQUE 4: Cálculo de saldo ───────────────────────────────────────────────

function calcularSaldo(apuntes) {
    return apuntes.reduce(function (acumulado, apunte) {
        if (apunte.dh === 'H') {
            return acumulado + apunte.importe;
        } else {
            return acumulado - apunte.importe;
        }
    }, 0);
}

// ─── BLOQUE 5: Borrar apunte ──────────────────────────────────────────────────

function borrarApunte(indice) {
    const confirmado = confirm('¿Estás seguro de que quieres eliminar este apunte?');
    if (!confirmado) return;

    const apuntes = getApuntes();
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