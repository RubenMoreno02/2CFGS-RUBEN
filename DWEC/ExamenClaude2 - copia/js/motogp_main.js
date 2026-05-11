/**
 * MotoGP Manager — main.js
 * Alineado con motogp_index.html
 */

let todosPilotos = [];
let soloFavoritos = false;
let ordenActual = 'relevancia';

document.addEventListener('DOMContentLoaded', main);

function main() {
    if (!localStorage.getItem('pilotos')) {
        if (typeof data !== 'undefined' && data.pilotos) {
            setPilotos(data.pilotos);
        }
    }
    todosPilotos = getPilotos();

    poblarFiltroAnyo();
    poblarFiltroNacionalidad();
    pintarCards(todosPilotos);
    iniciarAutocomplete(todosPilotos);

    // ── Botones de ordenación ─────────────────────────────────────────────────
    document.getElementById('btnRelevancia').addEventListener('click', function () {
        ordenActual = 'relevancia';
        aplicarFiltros();
    });
    document.getElementById('btnVictorias').addEventListener('click', function () {
        ordenActual = 'victorias';
        aplicarFiltros();
    });
    document.getElementById('btnMundiales').addEventListener('click', function () {
        ordenActual = 'mundiales';
        aplicarFiltros();
    });

    // ── Filtros ───────────────────────────────────────────────────────────────
    document.getElementById('btnAplicar').addEventListener('click', function (e) {
        e.preventDefault();
        aplicarFiltros();
    });

    // ── Borrar filtros ────────────────────────────────────────────────────────
    document.getElementById('btnBorrarFiltros').addEventListener('click', function () {
        document.getElementById('inputBuscar').value = '';
        document.getElementById('anyoDesde').value = '';
        document.getElementById('anyoHasta').value = '';
        document.getElementById('selectMundiales').value = '';
        document.getElementById('selectNacionalidad').value = '';
        document.getElementById('errorMensaje').textContent = '';
        ordenActual = 'relevancia';
        soloFavoritos = false;
        limpiarNodos(document.getElementById('btnFavoritos'));
        document.getElementById('btnFavoritos').appendChild(document.createTextNode('Ver favoritos'));
        pintarCards(todosPilotos);
    });

    // ── Toggle favoritos ──────────────────────────────────────────────────────
    document.getElementById('btnFavoritos').addEventListener('click', function () {
        soloFavoritos = !soloFavoritos;
        limpiarNodos(this);
        this.appendChild(document.createTextNode(soloFavoritos ? 'Ver todos' : 'Ver favoritos'));
        aplicarFiltros();
    });

    // ── Búsqueda con botón ────────────────────────────────────────────────────
    document.getElementById('btnBuscar').addEventListener('click', function () {
        aplicarFiltros();
    });

    // ── Delegación de eventos sobre el listado de cards ───────────────────────
    document.getElementById('listado').addEventListener('click', function (e) {
        const btn = e.target;
        const id = parseInt(btn.dataset.id);

        if (btn.classList.contains('btn-ficha')) {
            const piloto = todosPilotos.find(function (p) { return p.id === id; });
            if (piloto) mostrarPanel(piloto);
        }

        if (btn.classList.contains('btn-editar')) {
            window.location.href = 'motogp_formulario.html?id=' + id;
        }

        if (btn.classList.contains('btn-eliminar')) {
            eliminarPiloto(id);
        }

        if (btn.classList.contains('btn-fav')) {
            toggleFavorito(id);
            pintarCards(aplicarFiltrosSilencioso());
        }
    });

    // ── Cerrar sidebar ────────────────────────────────────────────────────────
    document.addEventListener('click', function (e) {
        if (e.target && e.target.id === 'btnCerrarSidebar') {
            document.getElementById('sidebar').style.display = 'none';
            limpiarNodos(document.getElementById('contenidoSidebar'));
        }
    });
}

// ══════════════════════════════════════════════════════════════════════════════
// BLOQUE 1 — Renderizado de cards
// ══════════════════════════════════════════════════════════════════════════════

function pintarCards(pilotos) {
    const contenedor = document.getElementById('listado');
    limpiarNodos(contenedor);

    if (pilotos.length === 0) {
        const p = document.createElement('p');
        p.classList.add('text-muted');
        p.appendChild(document.createTextNode('No se encontraron pilotos.'));
        contenedor.appendChild(p);
        return;
    }

    pilotos.forEach(function (piloto) {
        contenedor.appendChild(crearCard(piloto));
    });
}

function crearCard(piloto) {
    const favoritos = getFavoritos();
    const esFavorito = favoritos.includes(piloto.id);

    // Card principal
    const card = document.createElement('div');
    card.classList.add('card', 'mb-4');
    if (esFavorito) card.classList.add('border', 'border-warning');

    // Imagen
    const img = document.createElement('img');
    img.classList.add('card-img-top');
    img.src = piloto.imagen || '';
    img.alt = piloto.nombre + ' ' + piloto.apellidos;
    card.appendChild(img);

    // Card body
    const cardBody = document.createElement('div');
    cardBody.classList.add('card-body');
    card.appendChild(cardBody);

    // Título: #número + nombre
    const titulo = document.createElement('h2');
    titulo.classList.add('card-title');
    titulo.appendChild(document.createTextNode('#' + piloto.numero + ' ' + piloto.nombre + ' ' + piloto.apellidos));
    cardBody.appendChild(titulo);

    // Equipo (badge)
    const rowEquipo = document.createElement('div');
    rowEquipo.classList.add('row', 'justify-content-end');
    const colEquipo = document.createElement('div');
    colEquipo.classList.add('p-2', 'mb-1', 'col-md-3', 'offset-md-3', 'bg-warning', 'rounded', 'text-center');
    const h5Equipo = document.createElement('h5');
    h5Equipo.appendChild(document.createTextNode(piloto.equipo));
    colEquipo.appendChild(h5Equipo);
    rowEquipo.appendChild(colEquipo);
    cardBody.appendChild(rowEquipo);

    // Tabla de estadísticas
    const rowStats = document.createElement('div');
    rowStats.classList.add('row');

    const cabeceras = ['Nacionalidad', 'Año nac.', 'Mundiales', 'Victorias'];
    const valores = [piloto.nacionalidad, piloto.anyo, piloto.mundiales, piloto.victorias];

    cabeceras.forEach(function (cab) {
        const col = document.createElement('div');
        col.classList.add('col', 'p-3', 'text-center', 'border-bottom', 'border-dark');
        col.appendChild(document.createTextNode(cab));
        rowStats.appendChild(col);
    });

    const separador = document.createElement('div');
    separador.classList.add('w-100');
    rowStats.appendChild(separador);

    valores.forEach(function (val) {
        const col = document.createElement('div');
        col.classList.add('col', 'p-3', 'text-center');
        const strong = document.createElement('strong');
        strong.appendChild(document.createTextNode(val));
        col.appendChild(strong);
        rowStats.appendChild(col);
    });

    cardBody.appendChild(rowStats);

    // Botones de acción
    const acciones = document.createElement('div');
    acciones.classList.add('mt-3');
    cardBody.appendChild(acciones);

    // Ver ficha
    const btnFicha = document.createElement('button');
    btnFicha.classList.add('btn', 'btn-danger', 'm-1', 'btn-ficha');
    btnFicha.dataset.id = piloto.id;
    btnFicha.appendChild(document.createTextNode('Ver ficha'));
    acciones.appendChild(btnFicha);

    // Editar (enlace que actúa como botón)
    const btnEditar = document.createElement('a');
    btnEditar.classList.add('btn', 'btn-primary', 'm-1', 'btn-editar');
    btnEditar.href = 'motogp_formulario.html?id=' + piloto.id;
    btnEditar.appendChild(document.createTextNode('Editar'));
    acciones.appendChild(btnEditar);

    // Eliminar
    const btnEliminar = document.createElement('button');
    btnEliminar.classList.add('btn', 'btn-secondary', 'm-1', 'btn-eliminar');
    btnEliminar.dataset.id = piloto.id;
    btnEliminar.appendChild(document.createTextNode('Eliminar'));
    acciones.appendChild(btnEliminar);

    // Favorito
    const btnFav = document.createElement('button');
    btnFav.classList.add('btn', 'btn-warning', 'm-1', 'btn-fav');
    btnFav.dataset.id = piloto.id;
    btnFav.appendChild(document.createTextNode(esFavorito ? '★' : '☆'));
    acciones.appendChild(btnFav);

    return card;
}

// ══════════════════════════════════════════════════════════════════════════════
// BLOQUE 2 — Sidebar / ficha detallada
// ══════════════════════════════════════════════════════════════════════════════

function mostrarPanel(piloto) {
    const sidebar = document.getElementById('sidebar');
    const contenido = document.getElementById('contenidoSidebar');
    limpiarNodos(contenido);

    const h5 = document.createElement('h5');
    h5.appendChild(document.createTextNode(piloto.nombre + ' ' + piloto.apellidos));
    contenido.appendChild(h5);

    const img = document.createElement('img');
    img.src = piloto.imagen || '';
    img.alt = piloto.nombre;
    img.classList.add('img-fluid', 'rounded', 'mb-2');
    contenido.appendChild(img);

    const tabla = document.createElement('table');
    tabla.classList.add('table', 'table-sm');

    const filas = [
        ['Equipo',       piloto.equipo],
        ['Número',       '#' + piloto.numero],
        ['Nacionalidad', piloto.nacionalidad],
        ['Año nac.',     piloto.anyo],
        ['Mundiales',    piloto.mundiales],
        ['Victorias',    piloto.victorias],
        ['Podios',       piloto.podios],
    ];

    filas.forEach(function (fila) {
        const tr = document.createElement('tr');
        const td1 = document.createElement('td');
        td1.appendChild(document.createTextNode(fila[0]));
        const td2 = document.createElement('td');
        td2.appendChild(document.createTextNode(fila[1]));
        tr.appendChild(td1);
        tr.appendChild(td2);
        tabla.appendChild(tr);
    });

    contenido.appendChild(tabla);

    const btnCerrar = document.createElement('button');
    btnCerrar.classList.add('btn', 'btn-secondary', 'w-100');
    btnCerrar.id = 'btnCerrarSidebar';
    btnCerrar.appendChild(document.createTextNode('Cerrar'));
    contenido.appendChild(btnCerrar);

    sidebar.style.display = 'block';
}

// ══════════════════════════════════════════════════════════════════════════════
// BLOQUE 3 — Filtros, búsqueda y ordenación
// ══════════════════════════════════════════════════════════════════════════════

function iniciarAutocomplete(pilotos) {
    const sugerencias = [];
    const vistos = {};

    pilotos.forEach(function (piloto) {
        const nombreCompleto = piloto.nombre + ' ' + piloto.apellidos;
        if (!vistos[nombreCompleto]) {
            vistos[nombreCompleto] = true;
            sugerencias.push(nombreCompleto);
        }
        if (!vistos[piloto.equipo]) {
            vistos[piloto.equipo] = true;
            sugerencias.push(piloto.equipo);
        }
    });

    $('#inputBuscar').autocomplete({
        source: sugerencias,
        select: function (event, ui) {
            $('#inputBuscar').val(ui.item.value);
            aplicarFiltros();
            return false;
        }
    });

    $('#inputBuscar').on('input', function () {
        aplicarFiltros();
    });
}

function poblarFiltroAnyo() {
    const anyos = todosPilotos.map(function (p) { return p.anyo; });
    const unicos = anyos.filter(function (v, i, a) { return a.indexOf(v) === i; }).sort();

    const selectDesde = document.getElementById('anyoDesde');
    const selectHasta = document.getElementById('anyoHasta');

    limpiarNodos(selectDesde);
    limpiarNodos(selectHasta);

    const optDesde = document.createElement('option');
    optDesde.value = '';
    optDesde.appendChild(document.createTextNode('Desde'));
    selectDesde.appendChild(optDesde);

    const optHasta = document.createElement('option');
    optHasta.value = '';
    optHasta.appendChild(document.createTextNode('Hasta'));
    selectHasta.appendChild(optHasta);

    unicos.forEach(function (anyo) {
        const opt1 = document.createElement('option');
        opt1.value = anyo;
        opt1.appendChild(document.createTextNode(anyo));
        selectDesde.appendChild(opt1);

        const opt2 = document.createElement('option');
        opt2.value = anyo;
        opt2.appendChild(document.createTextNode(anyo));
        selectHasta.appendChild(opt2);
    });
}

function poblarFiltroNacionalidad() {
    const nacs = todosPilotos.map(function (p) { return p.nacionalidad; });
    const unicas = nacs.filter(function (v, i, a) { return a.indexOf(v) === i; }).sort();

    const select = document.getElementById('selectNacionalidad');
    limpiarNodos(select);

    const optTodas = document.createElement('option');
    optTodas.value = '';
    optTodas.appendChild(document.createTextNode('Todas'));
    select.appendChild(optTodas);

    unicas.forEach(function (nac) {
        const opt = document.createElement('option');
        opt.value = nac;
        opt.appendChild(document.createTextNode(nac));
        select.appendChild(opt);
    });
}

function aplicarFiltrosSilencioso() {
    return calcularResultado();
}

function aplicarFiltros() {
    const errorMsg = document.getElementById('errorMensaje');
    limpiarNodos(errorMsg);

    const anyoDesde = document.getElementById('anyoDesde').value;
    const anyoHasta = document.getElementById('anyoHasta').value;

    if (anyoDesde !== '' && anyoHasta !== '' && parseInt(anyoDesde) > parseInt(anyoHasta)) {
        errorMsg.appendChild(document.createTextNode('El año "Desde" no puede ser mayor que "Hasta".'));
        return;
    }

    pintarCards(calcularResultado());
}

function calcularResultado() {
    const texto       = document.getElementById('inputBuscar').value.toLowerCase().trim();
    const anyoDesde   = document.getElementById('anyoDesde').value;
    const anyoHasta   = document.getElementById('anyoHasta').value;
    const mundiales   = document.getElementById('selectMundiales').value;
    const nacionalidad = document.getElementById('selectNacionalidad').value;

    let resultado = todosPilotos.filter(function (piloto) {
        if (texto !== '') {
            const nombreCompleto = (piloto.nombre + ' ' + piloto.apellidos).toLowerCase();
            if (!nombreCompleto.includes(texto) && !piloto.equipo.toLowerCase().includes(texto)) return false;
        }
        if (anyoDesde !== '' && piloto.anyo < parseInt(anyoDesde)) return false;
        if (anyoHasta !== '' && piloto.anyo > parseInt(anyoHasta)) return false;
        if (mundiales !== '') {
            const min = parseInt(mundiales);
            if (min === 0 && piloto.mundiales !== 0) return false;
            if (min > 0 && piloto.mundiales < min) return false;
        }
        if (nacionalidad !== '' && piloto.nacionalidad !== nacionalidad) return false;
        if (soloFavoritos && !getFavoritos().includes(piloto.id)) return false;
        return true;
    });

    if (ordenActual === 'victorias') {
        resultado.sort(function (a, b) { return b.victorias - a.victorias; });
    } else if (ordenActual === 'mundiales') {
        resultado.sort(function (a, b) { return b.mundiales - a.mundiales; });
    } else {
        resultado.sort(function (a, b) { return a.numero - b.numero; });
    }

    return resultado;
}

// ══════════════════════════════════════════════════════════════════════════════
// BLOQUE 4 — Favoritos
// ══════════════════════════════════════════════════════════════════════════════

function toggleFavorito(id) {
    const favoritos = getFavoritos();
    const indice = favoritos.indexOf(id);
    if (indice === -1) {
        favoritos.push(id);
    } else {
        favoritos.splice(indice, 1);
    }
    setFavoritos(favoritos);
}

// ══════════════════════════════════════════════════════════════════════════════
// BLOQUE 5 — Eliminar piloto
// ══════════════════════════════════════════════════════════════════════════════

function eliminarPiloto(id) {
    if (!confirm('¿Seguro que quieres eliminar este piloto?')) return;
    const pilotos = getPilotos();
    const nuevos = pilotos.filter(function (p) { return p.id !== id; });
    setPilotos(nuevos);
    todosPilotos = getPilotos();
    pintarCards(calcularResultado());
}

// ══════════════════════════════════════════════════════════════════════════════
// UTILIDADES
// ══════════════════════════════════════════════════════════════════════════════

function limpiarNodos(elemento) {
    while (elemento.firstChild) {
        elemento.removeChild(elemento.firstChild);
    }
}

function getPilotos() {
    try {
        return JSON.parse(localStorage.getItem('pilotos')) || [];
    } catch (e) {
        localStorage.removeItem('pilotos');
        return [];
    }
}

function setPilotos(pilotos) {
    localStorage.setItem('pilotos', JSON.stringify(pilotos));
}

function getFavoritos() {
    try {
        return JSON.parse(localStorage.getItem('favoritos')) || [];
    } catch (e) {
        return [];
    }
}

function setFavoritos(favoritos) {
    localStorage.setItem('favoritos', JSON.stringify(favoritos));
}