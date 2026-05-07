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
        if(e.target.classlist.contains('btn-borrar')) {
            const indice = parseInt(e.target.dataset.indice, 10);
            borrarApunte(indice);
        }
    });


    //Falta ordenar por fecha



}



// UTILIDADES

//Limpiar nodos
function limpiarNodos(elemento){
    while (elemento.firstChild){
        elemento.removeChild(elemento.firstChild);
    }
}

//Faltan cosas

//function...





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
    tdSaldo.classList.add('text-end');
    tdSaldo.classList.add('fw-bold');
    if(saldo > 0) tdSaldo.classList.add('saldo-neg');
    else if (saldo < 0) tdSaldo.classList.add('saldo-neg');
    else tdSaldo.classList.add('saldo-zero');
    tdSaldo.appendChild(document.createTextNode(saldo.toFixed(2)));
    tr.appendChild(tdSaldo);

    return tr;
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