document.addEventListener("DOMContentLoaded", function(){
    main();
});

//Variables
let todosLosCoches = [];
let cochesFiltrados = [];
let ordenActual = "revelancia";
let textoBusqueda = "";

//funcion main
function main(){
    todosLosCoches = data.cars.slice();
    cochesFiltrados = todosLosCoches.slice();

    inicializarSelectoresAnio();
    inicializarAutocomplete();

    renderizarCoches();

    asignarEventos();
}

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

