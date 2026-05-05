document.addEventListener("DOMContentLoaded", function () {
    main();
});

function main() {
    let ordenActual = "relevancia"; // estado de ordenación actual

    cargarCoches(data.cars);
    cargarAnyos(data.cars);
    configurarAutocomplete(data.cars);
    configurarBotonesFiltro();
    configurarOrdenacion();

    // ─── Funciones de renderizado ────────────────────────────────────────────

    function cargarCoches(lista) {
        const listado = document.getElementById("listado");
        listado.innerHTML = "";

        lista.forEach(function (coche, index) {
            const precioFormateado = Number(coche.precio).toLocaleString("es-ES") + " €";
            const kmFormateado = Number(coche.km).toLocaleString("es-ES") + " Km.";

            const card = document.createElement("div");
            card.classList.add("card", "mb-4");

            card.innerHTML = `
                <a href="#!"><img class="card-img-top" src="img/${coche.img}" alt="${coche.marca} ${coche.modelo}" /></a>
                <div class="card-body">
                    <h2 class="card-title">${coche.marca} ${coche.modelo}</h2>
                    <div class="row justify-content-end">
                        <div class="p-2 mb-1 col-md-3 offset-md-3 bg-warning rounded text-center">
                            <h2 class="font-weight-bold">${precioFormateado}</h2>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col p-3 text-center border-bottom border-dark">Año</div>
                        <div class="col p-3 text-center border-bottom border-dark">Kilometros</div>
                        <div class="col p-3 text-center border-bottom border-dark">Cambio</div>
                        <div class="col p-3 text-center border-bottom border-dark">Combustible</div>
                        <div class="w-100"></div>
                        <div class="col p-3 text-center"><strong>${coche.anyo}</strong></div>
                        <div class="col p-3 text-center"><strong>${kmFormateado}</strong></div>
                        <div class="col p-3 text-center"><strong>${coche.cambio}</strong></div>
                        <div class="col p-3 text-center"><strong>${coche.combustible}</strong></div>
                    </div>
                    <button class="btn btn-primary m-3 btn-reservar" data-index="${obtenerIndexReal(coche)}">Reservar</button>
                </div>
            `;

            listado.appendChild(card);
        });

        // Asignar eventos a los botones de reservar
        document.querySelectorAll(".btn-reservar").forEach(function (btn) {
            btn.addEventListener("click", function () {
                const idx = this.getAttribute("data-index");
                localStorage.setItem("cocheSeleccionado", JSON.stringify(data.cars[idx]));
                window.location.href = "reserva.html";
            });
        });
    }

    function obtenerIndexReal(coche) {
        return data.cars.findIndex(c =>
            c.marca === coche.marca &&
            c.modelo === coche.modelo &&
            c.precio === coche.precio
        );
    }

    // ─── Año desde / hasta ───────────────────────────────────────────────────

    function cargarAnyos(lista) {
        const anyos = [...new Set(lista.map(c => c.anyo))].sort();

        const selectDesde = document.getElementById("anyoDesde");
        const selectHasta = document.getElementById("anyoHasta");

        selectDesde.innerHTML = '<option value="0" selected>Desde</option>';
        selectHasta.innerHTML = '<option value="9999" selected>Hasta</option>';

        anyos.forEach(function (anyo) {
            const optDesde = document.createElement("option");
            optDesde.value = anyo;
            optDesde.textContent = anyo;
            selectDesde.appendChild(optDesde);

            const optHasta = document.createElement("option");
            optHasta.value = anyo;
            optHasta.textContent = anyo;
            selectHasta.appendChild(optHasta);
        });
    }

    // ─── Autocomplete jQuery UI ──────────────────────────────────────────────

    function configurarAutocomplete(lista) {
        const sugerencias = lista.map(c => c.marca + " " + c.modelo);
        const sugerenciasUnicas = [...new Set(sugerencias)];

        $("#marcaModelo").autocomplete({
            source: sugerenciasUnicas,
            minLength: 1
        });
    }

    // ─── Filtros ─────────────────────────────────────────────────────────────

    function configurarBotonesFiltro() {
        // Botón Aplicar filtros
        document.getElementById("filtrar").addEventListener("click", function (e) {
            e.preventDefault();
            aplicarFiltros();
        });

        // Botón Buscar (Ir!)
        document.getElementById("ir").addEventListener("click", function () {
            aplicarFiltros();
        });

        // Buscar también al pulsar Enter en el campo de texto
        document.getElementById("marcaModelo").addEventListener("keypress", function (e) {
            if (e.key === "Enter") {
                aplicarFiltros();
            }
        });

        // Botón Eliminar filtros
        document.getElementById("eliminarFiltro").addEventListener("click", function (e) {
            e.preventDefault();
            document.getElementById("marcaModelo").val ? $("#marcaModelo").val("") : (document.getElementById("marcaModelo").value = "");
            document.getElementById("errorMensaje").textContent = "";
            cargarAnyos(data.cars);

            // Reset radio cambio a "Todos"
            document.querySelector('input[name="cambio"][value=""]').checked = true;

            // Recargar con la ordenación actual
            const listaOrdenada = ordenarLista(data.cars, ordenActual);
            cargarCoches(listaOrdenada);
        });
    }

    function aplicarFiltros() {
        const errorEl = document.getElementById("errorMensaje");
        errorEl.textContent = "";

        const textoBusqueda = document.getElementById("marcaModelo").value.toLowerCase().trim();

        const anyoDesde = parseInt(document.getElementById("anyoDesde").value) || 0;
        const anyoHasta = parseInt(document.getElementById("anyoHasta").value) || 9999;

        const kmDesde = parseInt(document.getElementById("kmDesde").value) || 0;
        const kmHasta = parseInt(document.getElementById("kmHasta").value) || 1000000;

        const cambio = document.querySelector('input[name="cambio"]:checked').value;
        const combustible = document.getElementById("combustible").value;

        // Validaciones de rango
        if (anyoDesde > anyoHasta && anyoHasta !== 9999) {
            errorEl.textContent = "Error: El año 'Desde' no puede ser mayor que el año 'Hasta'.";
            return;
        }
        if (kmDesde > kmHasta) {
            errorEl.textContent = "Error: Los kilómetros 'Desde' no pueden ser mayores que los 'Hasta'.";
            return;
        }

        let resultado = data.cars.filter(function (coche) {
            const anyoCoche = parseInt(coche.anyo);
            const kmCoche = parseInt(coche.km);
            const textoCoche = (coche.marca + " " + coche.modelo).toLowerCase();

            const coincideTexto = textoBusqueda === "" || textoCoche.includes(textoBusqueda);
            const coincideAnyo = anyoCoche >= anyoDesde && anyoCoche <= anyoHasta;
            const coincideKm = kmCoche >= kmDesde && kmCoche <= kmHasta;
            const coincideCambio = cambio === "" || coche.cambio === cambio;
            const coincideCombustible = combustible === "" || coche.combustible === combustible;

            return coincideTexto && coincideAnyo && coincideKm && coincideCambio && coincideCombustible;
        });

        resultado = ordenarLista(resultado, ordenActual);
        cargarCoches(resultado);
    }

    // ─── Ordenación ──────────────────────────────────────────────────────────

    function configurarOrdenacion() {
        document.getElementById("relevancia").addEventListener("click", function () {
            ordenActual = "relevancia";
            aplicarFiltros();
        });

        document.getElementById("precioAlto").addEventListener("click", function () {
            ordenActual = "precioAlto";
            aplicarFiltros();
        });

        document.getElementById("precioBajo").addEventListener("click", function () {
            ordenActual = "precioBajo";
            aplicarFiltros();
        });
    }

    function ordenarLista(lista, orden) {
        const copia = [...lista];
        if (orden === "precioAlto") {
            copia.sort((a, b) => parseInt(b.precio) - parseInt(a.precio));
        } else if (orden === "precioBajo") {
            copia.sort((a, b) => parseInt(a.precio) - parseInt(b.precio));
        } else {
            // Relevancia: orden original de data.cars
            copia.sort((a, b) => {
                return data.cars.indexOf(a) - data.cars.indexOf(b);
            });
        }
        return copia;
    }
}
