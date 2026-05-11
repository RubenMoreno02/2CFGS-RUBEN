document.addEventListener('DOMContentLoaded', main);

//Función Main
function main(){
    fetch('datos.json')
        .then(response => response.json())
        .then(json => {
            if(!localStorage.getItem('apuntes')){
                setApuntes(json.apuntes);
            }
            pintarTodos(getApuntes());
        })
        .catch(err => console.error('Error del json', err));

    document.getElementById('btnGrabar').addEventListener('click', grabarApunte);

    document.getElementById('cuerpoTabla').addEventListener('click', function (e){
        if(e.target.classList.contains('btn-borrar')) {
            const indice = parseInt(e.target.dataset.indice, 10);
            borrarApunte(indice);
        }
    });


    //Ordenar por fecha
    document.getElementById('btnSortAsc').addEventListener('click', function (){
        document.getElementById('btnSortAsc').classList.add('actiu');
        document.getElementById('btnSortDesc').classList.remove('actiu');
        const apuntes = getApuntes().sort((a, b) => compararFechas(a.fecha, b.fecha));
        setApuntes(apuntes);
        pintarTodos(apuntes);
    });

    document.getElementById('btnSortDesc').addEventListener('click', function(){
        document.getElementById('btnSortDesc').classList.add('actiu');
        document.getElementById('btnSortAsc').classList.remove('actiu');
        const apuntes = getApuntes().sort((a, b) => compararFechas(b.fecha, a.fecha));
        setApuntes(apuntes);
        pintarTodos(apuntes);
    });
}



// UTILIDADES

//Limpiar nodos
function limpiarNodos(elemento){
    while (elemento.firstChild){
        elemento.removeChild(elemento.firstChild);
    }
}

//Convierte la fecha
function fechaADate(fechaStr){
    const partes = fechaStr.split('/');
    return new Date(parseInt(partes[2], 10), parseInt(partes[1], 10) - 1, parseInt(partes[0], 10));
}

function compararFechas(fechaA, fechaB){
    return fechaADate(fechaA) - fechaADate(fechaB);
}




//Pintar apuntes

function pintarTodos(apuntes) {
    const cuerpo = document.getElementById('cuerpoTabla');
    limpiarNodos(cuerpo);

    let saldoAcumulado = 0;

    apuntes.forEach(function (apunte, indice){
        if(apunte.dh === 'H'){
            saldoAcumulado += apunte.importe;
        } else{
            saldoAcumulado -= apunte.importe;
        }

        const fila = crearFila(apunte, saldoAcumulado, indice);
        cuerpo.appendChild(fila);
    });

    const saldoEl = document.getElementById('saldoActual');
    limpiarNodos(saldoEl);
    saldoEl.appendChild(document.createTextNode(saldoAcumulado.toFixed(2)));

    const comptador = document.getElementById('comptador');
    limpiarNodos(comptador);
    comptador.appendChild(document.createTextNode(apuntes.length + ' registres'));
}


//Crear filas en tabla
function crearFila(apunte, saldo, indice){
    const tr = document.createElement('tr');

    //Botón borrar
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

    //Fecha
    const tdFecha = document.createElement('td');
    tdFecha.appendChild(document.createTextNode(apunte.fecha));
    tr.appendChild(tdFecha);

    //Concepto
    const tdConcepto = document.createElement('td');
    tdConcepto.appendChild(document.createTextNode(apunte.concepto));
    tr.appendChild(tdConcepto);

    // D / H
    const tdDh = document.createElement('td');
    tdDh.classList.add('text-center');
    const spanDh = document.createElement('span');
    spanDh.classList.add('badge-' + apunte.dh.toLowerCase());
    spanDh.appendChild(document.createTextNode(apunte.dh));
    tdDh.appendChild(spanDh);
    tr.appendChild(tdDh);

    //Importe
    const tdImporte = document.createElement('td');
    tdImporte.classList.add('text-end');
    tdImporte.appendChild(document.createTextNode(apunte.importe.toFixed(2)));
    tr.appendChild(tdImporte);

    //Saldo
    const tdSaldo = document.createElement('td');
    tdSaldo.classList.add('text-end', 'fw-bold');
    
    if(saldo > 0) tdSaldo.classList.add('saldo-neg');
    else if (saldo < 0) tdSaldo.classList.add('saldo-neg');
    else tdSaldo.classList.add('saldo-zero');
    tdSaldo.appendChild(document.createTextNode(saldo.toFixed(2)));
    tr.appendChild(tdSaldo);

    return tr;
}



//Validaciones

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




//Grabar apuntes
function grabarApunte(){
    const fechaRaw = document.getElementById('inpFecha').value.trim();
    const concepto = document.getElementById('inpConcepto').value.trim();
    const dh = document.getElementById('inpDH').value;
    const importe = document.getElementById('inpImporte').value;

    if(!validarFecha(fechaRaw)){
        alert('La fecha no es correcta');
        return;
    }
    if(!validarConcepto(concepto)){
        alert('Concepto no vacio');
        return;
    }
    if(!validarDH(dh)){
        alert('seleccionar D o H');
        return;
    }
    if(!validarImporte(importe)){
        alert('Mayor que 0');
        return;
    }

    const partes = fechaRaw.split('-');
    const fechaFormateada = partes[2] + '/' + partes[1] + '/' + partes[0];

    const nuevoApunte = {
        fecha: fechaFormateada,
        concepto: concepto,
        dh: dh,
        importe: parseFloat(importe)
    };

    const apuntes = getApuntes();
    apuntes.push(nuevoApunte);
    setApuntes(apuntes);
    pintarTodos(apuntes);

    //limpiar formulario
    document.getElementById('inpFecha').value = '';
    document.getElementById('inpConcepto').value = '';
    document.getElementById('inpDH').value = '';
    document.getElementById('inpImporte').value = '';
}


//Cálculo de saldo
function calcularSaldo(apuntes){
    return apuntes.reduce(function(acumulado, apunte){
        if(apunte.dh === 'H'){
            return acumulado + apunte.importe;
        } else {
            return acumulado - apunte.importe;
        }
    }, 0);
}


//Borrar apunte
function borrarApunte(indice){
    const confirmado = confirm('¿Quieres borrarlo parguela?');
    if (!confirmado) return;

    const apuntes = getApuntes();
    apuntes.splice(indice, 1);
    setApuntes(apuntes);
    pintarTodos(apuntes);
}


//LocalStorage
function getApuntes(){
    try{
        return JSON.parse(localStorage.getItem('apuntes')) || [];
    } catch (e){
        localStorage.removeItem('apuntes');
        return [];
    }
}

function setApuntes(apuntes){
    localStorage.setItem('apuntes', JSON.stringify(apuntes));
}