//Bloque 1
/**Patron de inicio de sesion*/
document.addEventListener('DOMContentLoaded', () => {
    fetch('js/bbdd.json')
        .then(response => response.json())
        .then(jsonData => {
            data = jsonData; // Guardamos los datos en la variable global
            main();          // Arrancamos la lógica
        })
        .catch(error => console.error('Error cargando el JSON:', error));
});


function main() {
    // =============================================
    // ESTADO — copia de trabajo del array
    // =============================================
    let cochesActuales = [...data.cars];

    // =============================================
    // UTILIDAD — limpiar nodos hijos de un elemento
    // =============================================
    function limpiarNodos(elemento) {
        while (elemento.firstChild) {
            elemento.removeChild(elemento.firstChild);
        }
    }

    // =============================================
    // BLOQUE 2 — Renderizado de tarjetas (DOM puro)
    // =============================================
    function crearTarjeta(coche, index) {
        const precioFormateado = parseInt(coche.precio).toLocaleString('es-ES');
        const kmFormateado = parseInt(coche.km).toLocaleString('es-ES');

        //--CARD
        const card = document.createElement('div');
        card.classList.add('card', 'mb-4');

        //--IMAGEN
        const enlaceImg = document.createElement('a');
        enlaceImg.href = '#!';
        const img = document.createElement('img');
        img.classList.add('card-img-top');
        img.src = `img/${coche.img}`;
        img.alt = `${coche.marca} ${coche.modelo}`;
        enlaceImg.appendChild(img);

        //--CARD BODY
        const cardBody = document.createElement('div');
        cardBody.classList.add('card-body');

        //Titulo
        const titulo = document.createElement('h2');
        titulo.classList.add('card-title');
        titulo.appendChild(document.createTextNode(`${coche.marca} ${coche.modelo}`));

        //Precio
        const rowPrecio = document.createElement('div');
        rowPrecio.classList.add('row', 'justify-content-end');
        const divPrecio = document.createElement('div');
        divPrecio.classList.add('p-2', 'mb-1', 'col-md-3', 'offset-md-3', 'bg-warning', 'rounded', 'text-center')
        const h2Precio = document.createElement('h2');
        h2Precio.classList.add('font-weight-bold');
        h2Precio.appendChild(document.createTextNode(`${precioFormateado} €`));
        divPrecio.appendChild(h2Precio);
        rowPrecio.appendChild(divPrecio);

        //Fila cabeceras
        const rowDatos = document.createElement('div');
        rowDatos.classList.add('row');

        const cabeceras = ['Año', 'Kilometros', 'Cambio', 'Combustible'];
        cabeceras.forEach(texto => {
            const col = document.createElement('div');
            col.classList.add('col', 'p-3', 'text-center', 'border-bottom', 'border-dark');
            col.appendChild(document.createTextNode(texto));
            rowDatos.appendChild(col);
        });

        //Separador w-100
        const separador = document.createElement('div');
        separador.classList.add('w-100');
        rowDatos.appendChild(separador);

        //Fila valores
        const valores = [coche.anyo, `${kmFormateado} Km.`, coche.cambio, coche.combustible];
        valores.forEach(valor => {
            const col = document.createElement('div');
            col.classList.add('col', 'p-3', 'text-center');
            const strong = document.createElement('strong');
            strong.appendChild(document.createTextNode(valor));
            col.appendChild(strong);
            rowDatos.appendChild(col);
        })

        //Boton reservar
        const btnReservar = document.createElement('a');
        btnReservar.classList.add('btn', 'btn-primary', 'm-3');
        btnReservar.href = `reserva.html?id=${index}`;
        btnReservar.appendChild(document.createTextNode('Reservar'));

        //Montaje cardBody
        cardBody.appendChild(titulo);
        cardBody.appendChild(rowPrecio);
        cardBody.appendChild(rowDatos);
        cardBody.appendChild(btnReservar);

        //Montaje card completa
        card.appendChild(enlaceImg);
        card.appendChild(cardBody);

        return card;
    }

    function renderizarCoches(lista) {
        const listado = document.getElementById('listado');
        while (listado.firstChild) {
            listado.removeChild(listado.firstChild);
        }

        lista.forEach((coche, index) => {
            const tarjeta = crearTarjeta(coche, index);
            listado.appendChild(tarjeta);
        });
    }
    renderizarCoches(cochesActuales);

    // =============================================
    // BLOQUE 3 — Ordenación por precio
    // =============================================
    document.getElementById("relevancia").addEventListener('click', function () {
        cochesActuales = [...data.cars];
        renderizarCoches(cochesActuales);
    });

    document.getElementById('precioAlto').addEventListener('click', function () {
        // Copia para no mutar cochesActuales directamente con sort
        const ordenados = [...cochesActuales].sort(function (a, b) {
            return parseInt(b.precio) - parseInt(a.precio);
        });
        renderizarCoches(ordenados);
    });

    document.getElementById('precioBajo').addEventListener('click', function () {
        // Copia para no mutar cochesActuales directamente con sort
        const ordenados = [...cochesActuales].sort(function (a, b) {
            return parseInt(a.precio) - parseInt(b.precio);
        });
        renderizarCoches(ordenados);
    })

    // =============================================
    // BLOQUE 4 — Filtros
    // =============================================
    // --- 4.1 Poblar selects de año dinámicamente ---
    const anyos = [...new Set(data.cars.map(function (c) {
        return c.anyo;
    }))].sort();

    const selectDesde = document.getElementById("anyoDesde");
    const selectHasta = document.getElementById("anyoHasta");

    const optDesdeDefault = document.createElement('option');
    optDesdeDefault.value = '';
    optDesdeDefault.appendChild(document.createTextNode('Desde'));
    selectDesde.appendChild(optDesdeDefault);

    const optHastaDefault = document.createElement('option');
    optHastaDefault.value = '';
    optHastaDefault.appendChild(document.createTextNode('Hasta'));
    selectHasta.appendChild(optHastaDefault);

    anyos.forEach(function (anyo) {
        const optDesde = document.createElement('option');
        optDesde.value = anyo;
        optDesde.appendChild(document.createTextNode(anyo));
        selectDesde.appendChild(optDesde);

        const optHasta = document.createElement('option');
        optHasta.value = anyo;
        optHasta.appendChild(document.createTextNode(anyo));
        selectHasta.appendChild(optHasta);
    })

    // --- 4.2 Función de filtrado combinado ---
    function filtrar() {
        const errorMensaje = document.getElementById('errorMensaje');

        const anyoDesde = document.getElementById('anyoDesde').value;
        const anyoHasta = document.getElementById('anyoHasta').value;
        const kmDesde = parseInt(document.getElementById('kmDesde').value);
        const kmHasta = parseInt(document.getElementById('kmHasta').value);
        const cambio = document.querySelector('input[name="cambio"]:checked').value; //Importante
        const combustible = document.getElementById('combustible').value;
        const textoBusca = document.getElementById('marcaModelo').value.toLowerCase().trim();


        // --- 4.3 Validación desde/hasta ---
        limpiarNodos(errorMensaje);

        if (anyoDesde !== '' && anyoHasta !== '' && anyoDesde > anyoHasta){
            errorMensaje.appendChild(document.createTextNode('El año Desde no puede ser mayor que el año Hasta.'));
            return;
        }

        if (kmDesde > kmHasta) {
            errorMensaje.appendChild(document.createTextNode('Los kilómetros Desde no pueden ser mayores que los Hasta.'));
            return;
        }

        // --- 4.4 Aplicar todos los filtros sobre data.cars ---
        cochesActuales = data.cars.filter(function (coche) {

            if (anyoDesde !== '' && coche.anyo < anyoDesde) return false;
            if (anyoHasta !== '' && coche.anyo > anyoHasta) return false;
            if (parseInt(coche.km) < kmDesde) return false;
            if (parseInt(coche.km) > kmHasta) return false;
            if (cambio !== '' && coche.cambio !== cambio) return false;
            if (combustible !== '' && coche.combustible !== combustible) return false;

            if (textoBusca !== '') {
                const coincide = coche.marca.toLowerCase().includes(textoBusca) ||
                    coche.modelo.toLowerCase().includes(textoBusca);
                if (!coincide) return false;
            }

            return true;
        });
        renderizarCoches(cochesActuales);
    }

    // --- 4.5 Botón Aplicar ---
    document.getElementById('filtrar').addEventListener('click', function (e) {
        e.preventDefault();
        filtrar();
    });

    // --- 4.6 Botón Eliminar filtros ---
    document.getElementById('eliminarFiltro').addEventListener('click', function () {
        document.getElementById('marcaModelo').value = '';
        limpiarNodos(document.getElementById('errorMensaje'));
        cochesActuales = [...data.cars];
        renderizarCoches(cochesActuales);
    });

    // =============================================
    // BLOQUE 5 — jQuery UI Autocomplete
    // =============================================

    // Construir sugerencias: cada entrada tiene label (lo que se muestra)
    // y value (lo que se escribe en el input al seleccionar)
    // Añadimos marcas y modelos por separado sin repetidos
    const textosSugerencias = [];
    const vistos = {};

    data.cars.forEach(function (coche) {
        // Añadir marca si no está ya
        if (!vistos[coche.marca]) {
            vistos[coche.marca] = true;
            textosSugerencias.push(coche.marca);
        }
        // Añadir modelo completo (marca + modelo) si no está ya
        const marcaModelo = coche.marca + ' ' + coche.modelo;
        if (!vistos[marcaModelo]) {
            vistos[marcaModelo] = true;
            textosSugerencias.push(marcaModelo);
        }
    });

    $('#marcaModelo').autocomplete({
        source: textosSugerencias,
        select: function (event, ui) {
            // Metemos el valor seleccionado en el input manualmente
            // y lanzamos el filtro
            $('#marcaModelo').val(ui.item.value);
            filtrar();
            // Devolvemos false para que jQuery UI no sobreescriba
            // el input de nuevo después del select
            return false;
        }
    });

    // Botón #ir → lanza el filtro con lo que haya en el input
    document.getElementById('ir').addEventListener('click', function () {
        filtrar();
    });



}

