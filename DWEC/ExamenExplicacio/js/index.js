// ============================================================
// ARCHIVO: index.js  →  Lógica de la página principal
//
// CONCEPTO CLAVE - CÓMO FUNCIONA ESTE ARCHIVO:
// 1. El navegador carga la página HTML
// 2. Cuando termina de cargar, dispara el evento "DOMContentLoaded"
// 3. Ese evento llama a nuestra función "main()"
// 4. main() pone en marcha todo lo demás
// ============================================================


// ============================================================
// PUNTO DE ENTRADA - Lo primero que se ejecuta
// "document" = la página HTML completa
// "addEventListener" = "oye, cuando pase X, haz Y"
// "DOMContentLoaded" = evento que ocurre cuando el HTML está listo
// function main() = la función que se ejecuta cuando está listo
// ============================================================
document.addEventListener("DOMContentLoaded", function main() {

    // ----------------------------------------------------------
    // VARIABLES GLOBALES DE ESTADO
    // Estas variables "recuerdan" el estado actual de la página.
    // Son como post-its que guardamos mientras trabajamos.
    // ----------------------------------------------------------

    // ordenActual guarda cómo estamos ordenando ahora mismo.
    // "relevancia" = orden original de la bbdd (por defecto)
    let ordenActual = "relevancia";

    // cochesFiltrados guarda la lista de coches que se muestran ahora.
    // Al principio son TODOS los coches. Luego pueden filtrarse.
    // [...data.cars] = copia el array original (el "..." se llama spread operator)
    // Si no copiáramos, modificar cochesFiltrados modificaría data.cars también
    let cochesFiltrados = [...data.cars];


    // ----------------------------------------------------------
    // PASO 1: Cargar los coches en pantalla al arrancar
    // ----------------------------------------------------------
    // Llamamos a la función que pinta los coches.
    // Le pasamos data.cars = todos los coches de la bbdd
    mostrarCoches(data.cars);

    // ----------------------------------------------------------
    // PASO 2: Rellenar los desplegables de año "Desde" y "Hasta"
    // ----------------------------------------------------------
    cargarAnios();

    // ----------------------------------------------------------
    // PASO 3: Configurar el buscador con autocompletado (jQuery UI)
    // ----------------------------------------------------------
    configurarAutocompletado();

    // ----------------------------------------------------------
    // PASO 4: Asignar eventos a los botones de ORDENAR
    // "getElementById" busca en el HTML el elemento con ese id=""
    // ".addEventListener('click', function(){ })" = cuando hagan click, ejecuta esto
    // ----------------------------------------------------------

    // Botón "Relevancia" → vuelve al orden original de la bbdd
    document.getElementById("relevancia").addEventListener("click", function () {
        ordenActual = "relevancia";          // Guardamos que el orden es relevancia
        mostrarCoches(cochesFiltrados);      // Mostramos los coches filtrados (si hay) en orden original
    });

    // Botón "Precio más alto" → ordena de más caro a más barato (descendente)
    document.getElementById("precioAlto").addEventListener("click", function () {
        ordenActual = "precioAlto";
        mostrarCoches(cochesFiltrados);
    });

    // Botón "Precio más bajo" → ordena de más barato a más caro (ascendente)
    document.getElementById("precioBajo").addEventListener("click", function () {
        ordenActual = "precioBajo";
        mostrarCoches(cochesFiltrados);
    });

    // ----------------------------------------------------------
    // PASO 5: Botón "Ir!" de búsqueda
    // ----------------------------------------------------------
    document.getElementById("ir").addEventListener("click", function () {
        aplicarFiltros();   // Llamamos a la función que filtra todo junto
    });

    // ----------------------------------------------------------
    // PASO 6: Botón "Aplicar" filtros
    // ----------------------------------------------------------
    document.getElementById("filtrar").addEventListener("click", function (e) {
        // "e.preventDefault()" evita que el formulario recargue la página
        // Por defecto, un botón submit dentro de un <form> recarga la página. Esto lo evita.
        e.preventDefault();
        aplicarFiltros();
    });

    // ----------------------------------------------------------
    // PASO 7: Botón "Eliminar filtros"
    // ----------------------------------------------------------
    document.getElementById("eliminarFiltro").addEventListener("click", function () {
        // Limpiar el campo de texto de búsqueda
        document.getElementById("marcaModelo").value = "";

        // Resetear los desplegables de año a sus valores por defecto
        // Llamamos a cargarAnios() que los regenera desde cero
        cargarAnios();

        // Resetear kilómetros a "Desde" (valor 0) y "Hasta" (valor 1000000)
        document.getElementById("kmDesde").value = "0";
        document.getElementById("kmHasta").value = "1000000";

        // Resetear el radio button de cambio a "Todos" (el que tiene value="")
        // querySelectorAll busca TODOS los elementos que coincidan con el selector CSS
        // 'input[name="cambio"]' = todos los inputs con name="cambio"
        document.querySelectorAll('input[name="cambio"]').forEach(function (radio) {
            // Si el value del radio es "" (Todos), lo marcamos
            if (radio.value === "") {
                radio.checked = true;
            }
        });

        // Resetear combustible a "todos" (valor "")
        document.getElementById("combustible").value = "";

        // Limpiar mensaje de error
        document.getElementById("errorMensaje").textContent = "";

        // Resetear la lista de coches filtrados a TODOS los coches
        cochesFiltrados = [...data.cars];

        // Mostrar todos los coches con el orden actual
        mostrarCoches(cochesFiltrados);
    });


    // ===========================================================
    // FUNCIONES - Cada función hace UNA cosa concreta
    // Una función es un bloque de código reutilizable.
    // Se define con "function nombreFuncion(parametros) { código }"
    // Se ejecuta cuando alguien la "llama": nombreFuncion()
    // ===========================================================


    // -----------------------------------------------------------
    // FUNCIÓN: mostrarCoches(listadeCoches)
    // Recibe un array de coches y los pinta en el HTML.
    // CRITERIO 4: Usar DOM para cargar datos del JSON
    // CRITERIO 5: Ordenar por precio
    // -----------------------------------------------------------
    function mostrarCoches(listaCoches) {

        // Primero ordenamos según el estado actual
        // "let cochesOrdenados" = nueva variable con los coches en el orden correcto
        let cochesOrdenados = ordenarCoches(listaCoches);

        // Obtenemos el div donde van las tarjetas de coches
        // id="listado" en el HTML
        let listado = document.getElementById("listado");

        // Vaciamos el contenido anterior para no duplicar
        // "innerHTML" es el contenido HTML dentro de un elemento
        // Ponerlo a "" lo vacía completamente
        listado.innerHTML = "";

        // "forEach" recorre cada elemento del array uno por uno
        // "coche" es el nombre que le damos a cada elemento mientras lo recorremos
        cochesOrdenados.forEach(function (coche) {

            // Creamos una tarjeta HTML para este coche
            // Esta es la parte de MANIPULACIÓN DEL DOM:
            // Creamos elementos HTML desde JavaScript

            // createElement("div") = crea un <div> nuevo (todavía no está en la página)
            let card = document.createElement("div");
            // classList.add() añade una clase CSS al elemento
            card.classList.add("card", "mb-4");   // Bootstrap: card con margen inferior

            // Formateamos el precio con puntos de miles para mostrarlo bonito
            // Ej: "159999" → "159.999 €"
            // "parseInt" convierte texto a número entero
            // "toLocaleString('es-ES')" formatea el número con el separador europeo (.)
            let precioFormateado = parseInt(coche.precio).toLocaleString('es-ES') + " €";

            // Formateamos los km igual
            let kmFormateado = parseInt(coche.km).toLocaleString('es-ES') + " Km.";

            // "innerHTML" = escribimos HTML directamente dentro del elemento
            // Los backticks ` ` permiten strings multilínea y meter variables con ${variable}
            // Esto es un TEMPLATE LITERAL - muy útil para generar HTML dinámico
            card.innerHTML = `
                <a href="#!">
                    <img class="card-img-top" src="img/${coche.img}" alt="${coche.marca} ${coche.modelo}" />
                </a>
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

                    <a class="btn btn-primary m-3 btnReservar" href="#!">Reservar</a>
                </div>
            `;

            // Ahora buscamos el botón "Reservar" dentro de la card que acabamos de crear
            // "querySelector" busca el PRIMER elemento que coincida con el selector CSS
            let btnReservar = card.querySelector(".btnReservar");

            // Asignamos el evento click al botón Reservar
            // Cuando hagan click, guardaremos el coche en sessionStorage y vamos a reserva.html
            btnReservar.addEventListener("click", function (e) {
                e.preventDefault();  // Evita que el href="#!" cambie la URL

                // sessionStorage = memoria temporal del navegador (se borra al cerrar pestaña)
                // localStorage = memoria permanente (no se borra)
                // "setItem(clave, valor)" guarda datos
                // "JSON.stringify(coche)" convierte el objeto JS a texto JSON para poder guardarlo
                // Los objetos JS no se pueden guardar directamente, hay que convertirlos a texto
                sessionStorage.setItem("cocheSeleccionado", JSON.stringify(coche));

                // Redirigimos al usuario a la página de reserva
                window.location.href = "reserva.html";
            });

            // "appendChild" añade el elemento al DOM (ahora sí aparece en la página)
            // Añadimos la card al div#listado
            listado.appendChild(card);
        });

        // Si no hay coches que mostrar, mostramos un mensaje
        if (cochesOrdenados.length === 0) {
            listado.innerHTML = '<p class="text-center text-muted mt-4">No se encontraron coches con esos criterios.</p>';
        }
    }


    // -----------------------------------------------------------
    // FUNCIÓN: ordenarCoches(listaCoches)
    // Recibe una lista y la devuelve ordenada según "ordenActual"
    // CRITERIO 5: Ordenación por precio
    // -----------------------------------------------------------
    function ordenarCoches(listaCoches) {

        // "slice()" crea una copia del array para no modificar el original
        // ".sort()" ordena el array. Recibe una función comparadora.
        // La función comparadora recibe dos elementos (a, b) y:
        //   - Si devuelve número negativo → a va antes que b
        //   - Si devuelve número positivo → b va antes que a
        //   - Si devuelve 0 → son iguales (no cambia orden)

        if (ordenActual === "precioAlto") {
            // Precio descendente: el más caro primero
            // parseInt convierte "159999" (texto) a 159999 (número)
            return listaCoches.slice().sort(function (a, b) {
                return parseInt(b.precio) - parseInt(a.precio);
                // Si b.precio > a.precio → resultado positivo → b va antes → más caro primero ✓
            });

        } else if (ordenActual === "precioBajo") {
            // Precio ascendente: el más barato primero
            return listaCoches.slice().sort(function (a, b) {
                return parseInt(a.precio) - parseInt(b.precio);
                // Si a.precio < b.precio → resultado negativo → a va antes → más barato primero ✓
            });

        } else {
            // "relevancia" = orden original. Devolvemos tal cual (copia)
            return listaCoches.slice();
        }
    }


    // -----------------------------------------------------------
    // FUNCIÓN: cargarAnios()
    // Rellena los <select> de "Año Desde" y "Año Hasta"
    // con los años de los coches, ordenados y sin repetir.
    // CRITERIO 6: Preparar filtros de año
    // -----------------------------------------------------------
    function cargarAnios() {

        // Paso 1: Extraer todos los años de los coches
        // ".map(función)" recorre el array y devuelve un nuevo array
        // con lo que devuelva la función para cada elemento
        let todosLosAnios = data.cars.map(function (coche) {
            return coche.anyo;  // De cada coche, solo queremos el año
        });
        // Resultado: ["2016", "2019", "2017", "2020", "2018", "2022", "2021"]

        // Paso 2: Eliminar repetidos usando Set
        // "new Set(array)" crea un conjunto matemático: sin duplicados
        // "[...new Set(...)]" vuelve a convertirlo a array
        let aniosSinRepetir = [...new Set(todosLosAnios)];

        // Paso 3: Ordenar de menor a mayor
        // ".sort()" sin función ordena como texto. Para números:
        // "a - b" ordena numéricamente ascendente
        aniosSinRepetir.sort(function (a, b) { return a - b; });

        // Paso 4: Obtener los selectores del HTML
        let selectDesde = document.getElementById("anyoDesde");
        let selectHasta = document.getElementById("anyoHasta");

        // Paso 5: Vaciar los selectores antes de rellenar (por si ya tenían opciones)
        selectDesde.innerHTML = "";
        selectHasta.innerHTML = "";

        // Paso 6: Añadir opción por defecto
        // Creamos un <option> con texto "Desde" y lo añadimos al select
        let optDesde = document.createElement("option");
        optDesde.value = "0";           // value="0" = año mínimo posible
        optDesde.textContent = "Desde"; // Texto que ve el usuario
        selectDesde.appendChild(optDesde);

        let optHasta = document.createElement("option");
        optHasta.value = "9999";        // value="9999" = año máximo posible
        optHasta.textContent = "Hasta";
        selectHasta.appendChild(optHasta);

        // Paso 7: Añadir cada año como <option>
        aniosSinRepetir.forEach(function (anio) {
            // Para el selector "Desde"
            let opcionDesde = document.createElement("option");
            opcionDesde.value = anio;       // El value es el año (para comparar)
            opcionDesde.textContent = anio; // El texto es el año (lo que ve el usuario)
            selectDesde.appendChild(opcionDesde);

            // Para el selector "Hasta" (hacemos lo mismo)
            let opcionHasta = document.createElement("option");
            opcionHasta.value = anio;
            opcionHasta.textContent = anio;
            selectHasta.appendChild(opcionHasta);
        });
    }


    // -----------------------------------------------------------
    // FUNCIÓN: configurarAutocompletado()
    // Usa jQuery UI Autocomplete para sugerir marcas/modelos
    // CRITERIO 8: Buscar marca y modelo con jQuery UI Autocomplete
    // -----------------------------------------------------------
    function configurarAutocompletado() {

        // Construimos la lista de sugerencias: todas las marcas y modelos
        let sugerencias = [];

        data.cars.forEach(function (coche) {
            // Añadimos la marca si no está ya en la lista
            if (!sugerencias.includes(coche.marca)) {
                sugerencias.push(coche.marca);
            }
            // Añadimos el modelo si no está ya
            if (!sugerencias.includes(coche.modelo)) {
                sugerencias.push(coche.modelo);
            }
            // Añadimos "MARCA modelo" combinado
            sugerencias.push(coche.marca + " " + coche.modelo);
        });

        // jQuery UI Autocomplete:
        // $("#marcaModelo") = selecciona el elemento con id="marcaModelo" (con jQuery)
        // .autocomplete({ source: lista }) = activa el autocompletado con esa lista
        $("#marcaModelo").autocomplete({
            source: sugerencias,  // Lista de sugerencias que aparecerán
            minLength: 1          // Empieza a sugerir desde 1 carácter escrito
        });
    }


    // -----------------------------------------------------------
    // FUNCIÓN: aplicarFiltros()
    // Lee todos los filtros del formulario y filtra los coches.
    // CRITERIO 7: Validar rangos desde-hasta
    // CRITERIO 9: Filtrar por año y km
    // CRITERIO 10: Funciona junto con eliminarFiltros
    // -----------------------------------------------------------
    function aplicarFiltros() {

        // Limpiar mensaje de error anterior
        document.getElementById("errorMensaje").textContent = "";

        // --- Leer los valores de los filtros ---

        // Texto de búsqueda (marca o modelo)
        // ".value" = el texto que hay escrito en un input
        // ".toLowerCase()" = lo convierte a minúsculas para comparar sin distinguir mayúsculas
        // ".trim()" = elimina espacios al principio y al final
        let textoBusqueda = document.getElementById("marcaModelo").value.toLowerCase().trim();

        // Años
        // "parseInt" convierte texto a número entero para poder comparar
        let anyoDesde = parseInt(document.getElementById("anyoDesde").value);
        let anyoHasta = parseInt(document.getElementById("anyoHasta").value);

        // Kilómetros
        let kmDesde = parseInt(document.getElementById("kmDesde").value);
        let kmHasta = parseInt(document.getElementById("kmHasta").value);

        // Cambio: obtenemos el radio button que está marcado
        // 'input[name="cambio"]:checked' = el input radio que esté marcado (checked)
        let cambioSeleccionado = document.querySelector('input[name="cambio"]:checked').value;

        // Combustible
        let combustibleSeleccionado = document.getElementById("combustible").value;

        // --- VALIDACIÓN DE RANGOS (Criterio 7) ---
        // Si "Desde" es mayor que "Hasta", es un error lógico

        // Validar año: solo si no son los valores por defecto (0 y 9999)
        if (anyoDesde !== 0 && anyoHasta !== 9999 && anyoDesde > anyoHasta) {
            // Mostramos error en el párrafo id="errorMensaje"
            document.getElementById("errorMensaje").textContent =
                "Error: El año 'Desde' no puede ser mayor que el año 'Hasta'.";
            return; // "return" sale de la función sin continuar
        }

        // Validar km: solo si no son los valores por defecto
        if (kmDesde !== 0 && kmHasta !== 1000000 && kmDesde > kmHasta) {
            document.getElementById("errorMensaje").textContent =
                "Error: Los km 'Desde' no pueden ser mayores que los km 'Hasta'.";
            return;
        }

        // --- FILTRADO (Criterio 9) ---
        // ".filter(función)" recorre el array y devuelve un nuevo array
        // solo con los elementos donde la función devuelva "true"
        // Es como preguntar: "¿este coche cumple todos los filtros?" → sí/no

        cochesFiltrados = data.cars.filter(function (coche) {

            // Para cada coche, comprobamos si pasa TODOS los filtros.
            // Si alguno falla, ese coche no se incluye.

            // Filtro 1: Texto de búsqueda
            // Si el usuario escribió algo, comprobamos que la marca O el modelo lo contengan
            let pasaBusqueda = true; // Por defecto pasa
            if (textoBusqueda !== "") {
                // ".includes(texto)" devuelve true si el string contiene ese texto
                let marcaCoincide = coche.marca.toLowerCase().includes(textoBusqueda);
                let modeloCoincide = coche.modelo.toLowerCase().includes(textoBusqueda);
                // El coche pasa si coincide la marca O el modelo ("||" = OR lógico)
                pasaBusqueda = marcaCoincide || modeloCoincide;
            }

            // Filtro 2: Año Desde
            let pasaAnyoDesde = true;
            if (anyoDesde !== 0) { // Si no es "Desde" (por defecto)
                pasaAnyoDesde = parseInt(coche.anyo) >= anyoDesde;
                // ">=" = mayor o igual que
            }

            // Filtro 3: Año Hasta
            let pasaAnyoHasta = true;
            if (anyoHasta !== 9999) { // Si no es "Hasta" (por defecto)
                pasaAnyoHasta = parseInt(coche.anyo) <= anyoHasta;
            }

            // Filtro 4: Km Desde
            let pasaKmDesde = true;
            if (kmDesde !== 0) {
                pasaKmDesde = parseInt(coche.km) >= kmDesde;
            }

            // Filtro 5: Km Hasta
            let pasaKmHasta = true;
            if (kmHasta !== 1000000) {
                pasaKmHasta = parseInt(coche.km) <= kmHasta;
            }

            // Filtro 6: Cambio
            let pasaCambio = true;
            if (cambioSeleccionado !== "") { // "" = "Todos", no filtramos
                pasaCambio = coche.cambio === cambioSeleccionado;
                // "===" compara valor Y tipo (es más estricto que "==")
            }

            // Filtro 7: Combustible
            let pasaCombustible = true;
            if (combustibleSeleccionado !== "") {
                pasaCombustible = coche.combustible === combustibleSeleccionado;
            }

            // El coche pasa el filtro solo si pasa TODOS los filtros
            // "&&" = AND lógico (todos deben ser true)
            return pasaBusqueda && pasaAnyoDesde && pasaAnyoHasta &&
                   pasaKmDesde && pasaKmHasta && pasaCambio && pasaCombustible;
        });

        // Mostramos los coches filtrados (con la ordenación actual)
        mostrarCoches(cochesFiltrados);
    }

}); // ← Cierre del DOMContentLoaded