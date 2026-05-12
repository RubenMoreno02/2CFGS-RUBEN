// Esperamos a que todo el HTML esté cargado
document.addEventListener("DOMContentLoaded", function() {
    main(); // Llamamos a la función principal (como pide el enunciado)
});

// -------------------------------------------------------
// VARIABLES GLOBALES (estado actual de la página)
// -------------------------------------------------------
let todosLosCoches = [];       // Copia de todos los coches originales
let cochesFiltrados = [];      // Lista que iremos filtrando/ordenando
let ordenActual = "relevancia"; // "relevancia" | "asc" | "desc"
let textoBusqueda = "";        // Texto del input de búsqueda

// -------------------------------------------------------
// FUNCIÓN PRINCIPAL
// -------------------------------------------------------
function main() {
    // 1. Cargamos los coches desde la variable global 'data' (bbdd.js)
    todosLosCoches = data.cars.slice(); // .slice() hace una copia
    cochesFiltrados = todosLosCoches.slice();

    // 2. Inicializamos los filtros (años y autocompletado)
    inicializarSelectoresAnio();
    inicializarAutocomplete();

    // 3. Pintamos los coches por primera vez
    renderizarCoches();

    // 4. Asignamos los eventos a botones, filtros, búsqueda...
    asignarEventos();
}

// -------------------------------------------------------
// 1. CARGAR LOS SELECTORES DE AÑO (DESDE / HASTA)
// -------------------------------------------------------
function inicializarSelectoresAnio() {
    // Obtenemos todos los años únicos de los coches y los ordenamos
    const aniosUnicos = [...new Set(todosLosCoches.map(c => c.anyo))]
                            .sort((a, b) => a - b); // orden numérico

    const selectDesde = document.getElementById("anyoDesde");
    const selectHasta = document.getElementById("anyoHasta");

    // Opción por defecto "Desde"
    selectDesde.innerHTML = `<option value="" selected>Desde</option>`;
    selectHasta.innerHTML = `<option value="" selected>Hasta</option>`;

    aniosUnicos.forEach(anio => {
        selectDesde.innerHTML += `<option value="${anio}">${anio}</option>`;
        selectHasta.innerHTML += `<option value="${anio}">${anio}</option>`;
    });
}

// -------------------------------------------------------
// 2. INICIALIZAR JQUERY UI AUTOCOMPLETE
// -------------------------------------------------------
function inicializarAutocomplete() {
    // Creamos un array con todas las marcas + modelos (sin repetir)
    const marcasModelos = [];
    todosLosCoches.forEach(coche => {
        if (!marcasModelos.includes(coche.marca)) marcasModelos.push(coche.marca);
        if (!marcasModelos.includes(coche.modelo)) marcasModelos.push(coche.modelo);
    });

    // Activamos el autocompletado sobre el input #marcaModelo
    $("#marcaModelo").autocomplete({
        source: marcasModelos, // de dónde salen las sugerencias
        minLength: 1           // empieza a sugerir tras 1 carácter
    });
}

// -------------------------------------------------------
// 3. RENDERIZAR LAS TARJETAS DE LOS COCHES EN EL DOM
// -------------------------------------------------------
function renderizarCoches() {
    const contenedor = document.getElementById("listado");
    contenedor.innerHTML = ""; // Limpiamos el contenedor

    if (cochesFiltrados.length === 0) {
        contenedor.innerHTML = `<p class="text-center">No se han encontrado coches.</p>`;
        return;
    }

    // Recorremos los coches que toca mostrar y creamos su HTML con DOM
    cochesFiltrados.forEach(coche => {
        // Crear la tarjeta (columna)
        const card = document.createElement("div");
        card.className = "card mb-4";

        // Imagen
        const img = document.createElement("img");
        img.className = "card-img-top";
        img.src = `img/${coche.img}`;
        img.alt = coche.modelo;

        // Cuerpo de la tarjeta
        const cardBody = document.createElement("div");
        cardBody.className = "card-body";

        // Título (marca + modelo)
        const titulo = document.createElement("h2");
        titulo.className = "card-title";
        titulo.textContent = `${coche.marca} ${coche.modelo}`;

        // Fila del precio (esquina superior derecha)
        const rowPrecio = document.createElement("div");
        rowPrecio.className = "row justify-content-end";
        const precioDiv = document.createElement("div");
        precioDiv.className = "p-2 mb-1 col-md-3 offset-md-3 bg-warning rounded text-center";
        const precioTexto = document.createElement("h2");
        precioTexto.className = "font-weight-bold";
        precioTexto.textContent = `${coche.precio} €`; // El precio viene como string
        precioDiv.appendChild(precioTexto);
        rowPrecio.appendChild(precioDiv);

        // Tabla de especificaciones (año, km, cambio, combustible)
        const tabla = document.createElement("div");
        tabla.className = "row";

        // Cabeceras
        const cabAnio = crearCeldaCabecera("Año");
        const cabKm = crearCeldaCabecera("Kilometros");
        const cabCambio = crearCeldaCabecera("Cambio");
        const cabComb = crearCeldaCabecera("Combustible");
        tabla.appendChild(cabAnio);
        tabla.appendChild(cabKm);
        tabla.appendChild(cabCambio);
        tabla.appendChild(cabComb);

        // Salto de línea (w-100)
        const salto = document.createElement("div");
        salto.className = "w-100";
        tabla.appendChild(salto);

        // Valores
        const valAnio = crearCeldaValor(coche.anyo);
        const valKm = crearCeldaValor(`${coche.km} Km.`);
        const valCambio = crearCeldaValor(coche.cambio);
        const valComb = crearCeldaValor(coche.combustible);
        tabla.appendChild(valAnio);
        tabla.appendChild(valKm);
        tabla.appendChild(valCambio);
        tabla.appendChild(valComb);

        // Botón Reservar
        const botonReservar = document.createElement("a");
        botonReservar.className = "btn btn-primary m-3";
        botonReservar.href = "#!";
        botonReservar.textContent = "Reservar";
        // Al hacer clic guardamos el coche en localStorage y vamos a reserva.html
        botonReservar.addEventListener("click", function(e) {
            e.preventDefault();
            // Guardamos el objeto coche completo en localStorage
            localStorage.setItem("cocheSeleccionado", JSON.stringify(coche));
            window.location.href = "reserva.html";
        });

        // Construimos la tarjeta
        card.appendChild(img);
        cardBody.appendChild(titulo);
        cardBody.appendChild(rowPrecio);
        cardBody.appendChild(tabla);
        cardBody.appendChild(botonReservar);
        card.appendChild(cardBody);
        contenedor.appendChild(card);
    });
}

// Funciones auxiliares para crear celdas
function crearCeldaCabecera(texto) {
    const div = document.createElement("div");
    div.className = "col p-3 text-center border-bottom border-dark";
    div.textContent = texto;
    return div;
}
function crearCeldaValor(texto) {
    const div = document.createElement("div");
    div.className = "col p-3 text-center";
    const strong = document.createElement("strong");
    strong.textContent = texto;
    div.appendChild(strong);
    return div;
}

// -------------------------------------------------------
// 4. APLICAR FILTROS Y ORDENACIÓN
// -------------------------------------------------------
function aplicarFiltrosYOrden() {
    // Partimos de la lista original
    cochesFiltrados = todosLosCoches.slice();

    // --- Filtro por texto (marca o modelo) ---
    if (textoBusqueda.trim() !== "") {
        const texto = textoBusqueda.trim().toLowerCase();
        cochesFiltrados = cochesFiltrados.filter(coche =>
            coche.marca.toLowerCase().includes(texto) ||
            coche.modelo.toLowerCase().includes(texto)
        );
    }

    // --- Filtro de año desde / hasta ---
    const anyoDesde = document.getElementById("anyoDesde").value;
    const anyoHasta = document.getElementById("anyoHasta").value;
    if (anyoDesde) {
        cochesFiltrados = cochesFiltrados.filter(c => parseInt(c.anyo) >= parseInt(anyoDesde));
    }
    if (anyoHasta) {
        cochesFiltrados = cochesFiltrados.filter(c => parseInt(c.anyo) <= parseInt(anyoHasta));
    }

    // --- Filtro de kilómetros ---
    const kmDesde = parseInt(document.getElementById("kmDesde").value);
    const kmHasta = parseInt(document.getElementById("kmHasta").value);
    if (kmDesde > 0) {
        cochesFiltrados = cochesFiltrados.filter(c => parseInt(c.km) >= kmDesde);
    }
    // kmHasta = 1000000 significa "todos", así que ignoramos si es ese valor
    if (kmHasta && kmHasta !== 1000000) {
        cochesFiltrados = cochesFiltrados.filter(c => parseInt(c.km) <= kmHasta);
    }

    // --- Filtro cambio (radio) ---
    const cambioSeleccionado = document.querySelector('input[name="cambio"]:checked').value;
    if (cambioSeleccionado) {
        cochesFiltrados = cochesFiltrados.filter(c => c.cambio === cambioSeleccionado);
    }

    // --- Filtro combustible ---
    const combustible = document.getElementById("combustible").value;
    if (combustible) {
        cochesFiltrados = cochesFiltrados.filter(c => c.combustible === combustible);
    }

    // --- Ordenación ---
    if (ordenActual === "asc") {
        cochesFiltrados.sort((a, b) => parseInt(a.precio) - parseInt(b.precio));
    } else if (ordenActual === "desc") {
        cochesFiltrados.sort((a, b) => parseInt(b.precio) - parseInt(a.precio));
    }
    // Si es "relevancia" se queda en el orden original (el de data.cars)

    renderizarCoches();
}

// -------------------------------------------------------
// 5. VALIDAR RANGO DE AÑOS (DESDE no mayor que HASTA)
// -------------------------------------------------------
function validarRangoAnios() {
    const desde = document.getElementById("anyoDesde").value;
    const hasta = document.getElementById("anyoHasta").value;
    const errorMensaje = document.getElementById("errorMensaje");

    if (desde && hasta && parseInt(desde) > parseInt(hasta)) {
        errorMensaje.textContent = "El año 'Desde' no puede ser mayor que el año 'Hasta'.";
        return false;
    }
    errorMensaje.textContent = "";
    return true;
}

// -------------------------------------------------------
// 6. ASIGNAR TODOS LOS EVENTOS
// -------------------------------------------------------
function asignarEventos() {
    // --- Botones de ordenación ---
    document.getElementById("relevancia").addEventListener("click", function() {
        ordenActual = "relevancia";
        aplicarFiltrosYOrden();
    });
    document.getElementById("precioAlto").addEventListener("click", function() {
        ordenActual = "desc";
        aplicarFiltrosYOrden();
    });
    document.getElementById("precioBajo").addEventListener("click", function() {
        ordenActual = "asc";
        aplicarFiltrosYOrden();
    });

    // --- Botón "Ir!" de búsqueda ---
    document.getElementById("ir").addEventListener("click", function() {
        textoBusqueda = document.getElementById("marcaModelo").value;
        aplicarFiltrosYOrden();
    });

    // También buscamos al pulsar Enter en el campo de texto
    document.getElementById("marcaModelo").addEventListener("keypress", function(e) {
        if (e.key === "Enter") {
            textoBusqueda = e.target.value;
            aplicarFiltrosYOrden();
        }
    });

    // --- Botón "Aplicar" del formulario de filtros ---
    document.getElementById("filtrar").addEventListener("click", function(e) {
        e.preventDefault(); // Para que el formulario no se envíe
        if (validarRangoAnios()) {
            aplicarFiltrosYOrden();
        }
    });

    // --- Botón "Eliminar filtros" (reset) ---
    document.getElementById("eliminarFiltro").addEventListener("click", function(e) {
        // El formulario se resetea porque es type="reset", pero necesitamos
        // limpiar también el campo de búsqueda y recargar todo
        document.getElementById("marcaModelo").value = "";
        textoBusqueda = "";
        ordenActual = "relevancia";
        cochesFiltrados = todosLosCoches.slice();
        renderizarCoches();
        document.getElementById("errorMensaje").textContent = "";
    });
}