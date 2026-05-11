// Esperamos a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', main);

// Variables globales
let jugadores = [];           // Todos los jugadores obtenidos del JSON
let jugadoresOriginal = [];   // Copia para restaurar orden de relevancia
let ordenActual = 'relevancia'; // Estado de la ordenación

/**
 * Función principal que se ejecuta al cargar la página.
 * Carga los datos, configura eventos y muestra la lista.
 */
async function main() {
    try {
        // 1. Cargar los jugadores desde el archivo JSON
        const respuesta = await fetch('jugadores.json');
        if (!respuesta.ok) throw new Error('Error al cargar jugadores.json');
        jugadores = await respuesta.json();
        jugadoresOriginal = [...jugadores]; // Copia inmutable para relevancia

        // 2. Configurar interfaz y eventos
        configurarAutocomplete();
        rellenarSelectsEdad();
        configurarEventosFiltros();
        configurarBotonesOrdenacion();
        mostrarJugadores(jugadores); // Mostrar todos inicialmente
    } catch (error) {
        console.error('Error al inicializar:', error);
        document.getElementById('listado').innerHTML =
            '<div class="alert alert-danger">Error al cargar los datos de jugadores.</div>';
    }
}

/**
 * Configura el autocomplete de jQuery UI para la búsqueda por nombre.
 */
function configurarAutocomplete() {
    // Extraer solo los nombres para la fuente del autocomplete
    const nombres = jugadores.map(j => j.nombre);
    $('#nombreBusqueda').autocomplete({
        source: nombres,
        minLength: 2
    });
}

/**
 * Rellena los selectores de edad con los valores únicos de los jugadores, ordenados.
 */
function rellenarSelectsEdad() {
    // Obtener edades únicas ordenadas
    const edades = [...new Set(jugadores.map(j => j.edad))].sort((a, b) => a - b);

    const desde = document.getElementById('edadDesde');
    const hasta = document.getElementById('edadHasta');

    // Limpiar opciones previas
    desde.innerHTML = '';
    hasta.innerHTML = '';

    // Crear opciones para ambos selects
    edades.forEach(edad => {
        desde.innerHTML += `<option value="${edad}">${edad}</option>`;
        hasta.innerHTML += `<option value="${edad}">${edad}</option>`;
    });

    // Seleccionar por defecto el rango completo (mínimo en desde, máximo en hasta)
    if (edades.length > 0) {
        desde.value = edades[0];
        hasta.value = edades[edades.length - 1];
    }
}

/**
 * Asigna los eventos relacionados con los filtros (aplicar, reset, validación en caliente).
 */
function configurarEventosFiltros() {
    // Botón "Ir!" para buscar por nombre
    document.getElementById('ir').addEventListener('click', () => {
        aplicarFiltros();
    });

    // Envío del formulario de filtros (botón Aplicar)
    document.getElementById('formFiltros').addEventListener('submit', (e) => {
        e.preventDefault();
        aplicarFiltros();
    });

    // Botón de eliminar filtros (reset)
    document.getElementById('eliminarFiltro').addEventListener('click', () => {
        // Limpiar campo de búsqueda
        document.getElementById('nombreBusqueda').value = '';
        // Restablecer selects de edad a los valores por defecto
        rellenarSelectsEdad();
        // Restablecer partidos a sus opciones por defecto
        document.getElementById('partidosDesde').value = '0';
        document.getElementById('partidosHasta').value = '500';
        // Posición: marcar "Todas"
        document.querySelector('input[name="posicion"][value=""]').checked = true;
        // Nacionalidad: "Todas"
        document.getElementById('nacionalidad').value = '';
        // Limpiar mensaje de error
        document.getElementById('errorMensaje').textContent = '';
        // Volver al orden de relevancia
        ordenActual = 'relevancia';
        // Mostrar la lista original completa
        jugadores = [...jugadoresOriginal];
        mostrarJugadores(jugadores);
    });
}

/**
 * Configura los botones de ordenación: relevancia, precio más alto, precio más bajo.
 */
function configurarBotonesOrdenacion() {
    document.getElementById('relevancia').addEventListener('click', () => {
        ordenActual = 'relevancia';
        aplicarFiltros(); // Vuelve a aplicar filtros respetando relevancia
    });
    document.getElementById('precioAlto').addEventListener('click', () => {
        ordenActual = 'desc';
        aplicarFiltros();
    });
    document.getElementById('precioBajo').addEventListener('click', () => {
        ordenActual = 'asc';
        aplicarFiltros();
    });
}

/**
 * Recoge los valores de todos los filtros, los valida y aplica sobre los datos.
 */
function aplicarFiltros() {
    // Leer valores de los filtros
    const nombre = document.getElementById('nombreBusqueda').value.trim().toLowerCase();
    const edadDesde = parseInt(document.getElementById('edadDesde').value);
    const edadHasta = parseInt(document.getElementById('edadHasta').value);
    const pDesde = parseInt(document.getElementById('partidosDesde').value);
    const pHasta = parseInt(document.getElementById('partidosHasta').value);
    const posicion = document.querySelector('input[name="posicion"]:checked').value;
    const nacionalidad = document.getElementById('nacionalidad').value;

    // Validación de rangos
    if (edadDesde > edadHasta) {
        document.getElementById('errorMensaje').textContent =
            'La edad "desde" no puede ser mayor que "hasta".';
        return;
    }
    if (pDesde > pHasta) {
        document.getElementById('errorMensaje').textContent =
            'Los partidos "desde" no pueden ser mayores que "hasta".';
        return;
    }
    // Limpiar mensaje si no hay errores
    document.getElementById('errorMensaje').textContent = '';

    // Empezamos con una copia del array original para no perder datos
    let resultado = [...jugadoresOriginal];

    // Filtrar por nombre (búsqueda por texto, se aplica junto al resto)
    if (nombre !== '') {
        resultado = resultado.filter(j =>
            j.nombre.toLowerCase().includes(nombre)
        );
    }

    // Filtrar por rango de edad
    resultado = resultado.filter(j =>
        j.edad >= edadDesde && j.edad <= edadHasta
    );

    // Filtrar por rango de partidos
    resultado = resultado.filter(j =>
        j.partidos >= pDesde && j.partidos <= pHasta
    );

    // Filtrar por posición
    if (posicion !== '') {
        resultado = resultado.filter(j => j.posicion === posicion);
    }

    // Filtrar por nacionalidad
    if (nacionalidad !== '') {
        resultado = resultado.filter(j => j.nacionalidad === nacionalidad);
    }

    // Ordenar según el estado actual
    ordenarJugadores(resultado);

    // Guardar la referencia actual para que los botones de ordenación funcionen
    // sobre los datos ya filtrados (según requisito: filtros + búsqueda simultánea)
    jugadores = resultado;

    // Mostrar en pantalla
    mostrarJugadores(resultado);
}

/**
 * Ordena el array según el criterio seleccionado (valor/precio).
 * @param {Array} lista - Lista de jugadores a ordenar (se modifica in-place).
 */
function ordenarJugadores(lista) {
    if (ordenActual === 'asc') {
        lista.sort((a, b) => a.valor - b.valor);
    } else if (ordenActual === 'desc') {
        lista.sort((a, b) => b.valor - a.valor);
    }
    // 'relevancia' no ordena, ya usamos el array en el orden en que se pasó
}

/**
 * Genera el HTML de las tarjetas y las inserta en el contenedor #listado.
 * Cada tarjeta muestra los datos principales y un botón "Reservar".
 * @param {Array} lista - Lista de jugadores a mostrar.
 */
function mostrarJugadores(lista) {
    const contenedor = document.getElementById('listado');
    if (lista.length === 0) {
        contenedor.innerHTML = '<div class="alert alert-warning">No se encontraron jugadores con esos criterios.</div>';
        return;
    }

    let html = '';
    lista.forEach(jugador => {
        html += `
        <div class="card mb-4">
            <a href="#!"><img class="card-img-top" src="${jugador.img}" alt="${jugador.nombre}" /></a>
            <div class="card-body">
                <div class="row">
                    <div class="col-8">
                        <h2 class="card-title">${jugador.nombre}</h2>
                        <p class="card-text">
                            <span class="badge bg-primary">${jugador.posicion}</span>
                            <span class="badge bg-secondary">#${jugador.dorsal}</span>
                        </p>
                    </div>
                    <div class="col-4 text-end">
                        <div class="p-2 mb-1 bg-warning rounded text-center d-inline-block">
                            <h2 class="font-weight-bold mb-0">${jugador.valor}M€</h2>
                        </div>
                    </div>
                </div>
                <div class="row mt-2">
                    <div class="col-3 text-center"><strong>Edad</strong><br>${jugador.edad}</div>
                    <div class="col-3 text-center"><strong>Partidos</strong><br>${jugador.partidos}</div>
                    <div class="col-3 text-center"><strong>Goles</strong><br>${jugador.goles}</div>
                    <div class="col-3 text-center"><strong>Nacionalidad</strong><br>${jugador.nacionalidad}</div>
                </div>
                <div class="text-end mt-3">
                    <button class="btn btn-danger btn-reservar" data-id="${jugador.id}">Reservar</button>
                </div>
            </div>
        </div>`;
    });

    contenedor.innerHTML = html;

    // Asignar evento a cada botón "Reservar"
    document.querySelectorAll('.btn-reservar').forEach(boton => {
        boton.addEventListener('click', (e) => {
            const id = parseInt(e.target.dataset.id);
            const jugadorSeleccionado = jugadores.find(j => j.id === id);
            if (jugadorSeleccionado) {
                // Guardar el jugador en localStorage antes de redirigir
                localStorage.setItem('jugadorSeleccionado', JSON.stringify(jugadorSeleccionado));
                window.location.href = 'reserva.html';
            }
        });
    });
}