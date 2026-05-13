/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║                          MEGA APUNTE — DWEC                                ║
 * ║            Recopilación de bloques, variantes y patrones de examen          ║
 * ║                                                                              ║
 * ║  REGLAS DE ORO (NO ROMPER NUNCA):                                           ║
 * ║  ✗ innerHTML prohibido (ni para limpiar)                                    ║
 * ║  ✗ textContent prohibido                                                    ║
 * ║  ✓ Limpiar siempre con limpiarNodos()                                       ║
 * ║  ✓ Texto siempre con createTextNode()                                       ║
 * ║  ✓ Elementos con createElement + classList.add + appendChild                ║
 * ║  ✓ main() SIEMPRE async — datos desde fetch() de bbdd.json                 ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */


// ============================================================
// PATRÓN BASE — Estructura mínima de cualquier script
// ============================================================

document.addEventListener('DOMContentLoaded', main);

async function main() {
    // 1. Cargar datos desde JSON (SIEMPRE fetch, nunca variable global .js)
    const response = await fetch('bbdd.json');
    const json = await response.json();
    // json.cars / json.pilotos / json.apuntes — según el examen

    // 2. Si la bbdd tiene que persistir en localStorage:
    if (!localStorage.getItem('items')) {
        setItems(json.items);
    }
    const todosLosItems = getItems();

    // 3. Renderizar
    pintarCards(todosLosItems);

    // 4. Inicializar filtros / autocomplete / eventos
}


// ============================================================
// UTILIDAD — limpiarNodos (OBLIGATORIA, extraída siempre)
// ============================================================

function limpiarNodos(elemento) {
    while (elemento.firstChild) {
        elemento.removeChild(elemento.firstChild);
    }
}


// ============================================================
// BLOQUE 0 — localStorage (CRUD básico)
// ============================================================

// ── Variante A: un único array (p.ej. coches, pilotos, apuntes) ──────────────
function getItems() {
    try {
        return JSON.parse(localStorage.getItem('items')) || [];
    } catch (e) {
        localStorage.removeItem('items');
        return [];
    }
}
function setItems(items) {
    localStorage.setItem('items', JSON.stringify(items));
}

// ── Variante B: array + clave separada (p.ej. favoritos) ─────────────────────
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

// ── Variante C: objeto único (p.ej. reserva con datos anidados) ──────────────
function guardarReserva(reserva) {
    localStorage.setItem('reserva', JSON.stringify(reserva));
}
function getReserva() {
    try {
        return JSON.parse(localStorage.getItem('reserva')) || null;
    } catch (e) {
        return null;
    }
}

// ── Borrar una clave ──────────────────────────────────────────────────────────
function borrarStorage(clave) {
    localStorage.removeItem(clave);
}


// ============================================================
// BLOQUE 1 — Renderizado de tarjetas (DOM puro)
// ============================================================

// ── 1.1 Pintar lista de cards (limpia el contenedor y repinta) ────────────────
function pintarCards(items) {
    const contenedor = document.getElementById('contenedor');
    limpiarNodos(contenedor);

    items.forEach(function (item, index) {
        const card = crearCard(item, index);
        contenedor.appendChild(card);
    });
}

// ── 1.2 Crear card genérica (adaptar campos según el examen) ─────────────────
function crearCard(item, index) {
    // Wrapper columna Bootstrap
    const col = document.createElement('div');
    col.classList.add('col');

    // Card
    const card = document.createElement('div');
    card.classList.add('card', 'mb-4');
    col.appendChild(card);

    // Imagen (si el item tiene img)
    const img = document.createElement('img');
    img.classList.add('card-img-top');
    img.src = 'img/' + item.img;
    img.alt = item.nombre || item.marca;
    card.appendChild(img);

    // Card body
    const body = document.createElement('div');
    body.classList.add('card-body');
    card.appendChild(body);

    // Título
    const titulo = document.createElement('h5');
    titulo.classList.add('card-title');
    titulo.appendChild(document.createTextNode(item.nombre || item.marca + ' ' + item.modelo));
    body.appendChild(titulo);

    // Campo genérico (repetir el patrón para cada dato)
    const p = document.createElement('p');
    p.classList.add('card-text');
    p.appendChild(document.createTextNode(item.descripcion || item.equipo || ''));
    body.appendChild(p);

    // ── Variante: precio formateado con toLocaleString ────────────────────────
    const precio = document.createElement('p');
    precio.classList.add('fw-bold');
    const precioFormateado = parseInt(item.precio).toLocaleString('es-ES');
    precio.appendChild(document.createTextNode(precioFormateado + ' €'));
    body.appendChild(precio);

    // ── Variante: badge / dorsal destacado ────────────────────────────────────
    const badge = document.createElement('div');
    badge.classList.add('dorsal');
    badge.appendChild(document.createTextNode(item.dorsal || index));
    card.appendChild(badge);

    // Botón acción principal (Ver detalle / Reservar / Ver ficha)
    const btnVer = document.createElement('button');   // o 'a' si es enlace
    btnVer.classList.add('btn', 'btn-primary');
    btnVer.appendChild(document.createTextNode('Ver ficha'));
    btnVer.dataset.id = index;                          // guardar índice o id en dataset
    body.appendChild(btnVer);

    // ── Variante: botón favorito con estrella ─────────────────────────────────
    const btnFav = document.createElement('button');
    btnFav.classList.add('btn-fav');
    btnFav.dataset.id = item.id || index;
    const favoritos = getFavoritos();
    if (favoritos.includes(item.id || index)) {
        card.classList.add('favorito');
        btnFav.appendChild(document.createTextNode('★'));
    } else {
        btnFav.appendChild(document.createTextNode('☆'));
    }
    body.appendChild(btnFav);

    return col;
}

// ── 1.3 Crear filas de tabla (variante tabla en lugar de cards) ───────────────
function crearFila(item, saldo, indice) {
    const tr = document.createElement('tr');

    // Botón borrar con dataset.indice
    const tdBtn = document.createElement('td');
    const btn = document.createElement('button');
    btn.classList.add('btn-borrar');
    btn.dataset.indice = indice;
    btn.appendChild(document.createTextNode('Borrar'));
    tdBtn.appendChild(btn);
    tr.appendChild(tdBtn);

    // Celdas de datos
    const campos = [item.fecha, item.concepto, item.dh, item.importe, saldo.toFixed(2)];
    campos.forEach(function (valor) {
        const td = document.createElement('td');
        td.appendChild(document.createTextNode(valor));
        tr.appendChild(td);
    });

    return tr;
}

// ── 1.4 Panel lateral / sidebar ───────────────────────────────────────────────
function mostrarPanel(item) {
    const sidebar = document.getElementById('sidebar');
    const contenido = document.getElementById('contenidoSidebar');
    limpiarNodos(contenido);

    const h2 = document.createElement('h2');
    h2.appendChild(document.createTextNode(item.nombre || item.marca));
    contenido.appendChild(h2);

    // Lista de campos: fácil de ampliar
    const campos = [
        { label: 'Equipo: ',      valor: item.equipo },
        { label: 'Dorsal: ',      valor: item.dorsal },
        { label: 'Nacimiento: ',  valor: item.fechaNacimiento },
        { label: 'Campeonatos: ', valor: item.campeonatos },
    ];

    campos.forEach(function (c) {
        const div = document.createElement('div');
        div.classList.add('campo');
        const span = document.createElement('span');
        span.appendChild(document.createTextNode(c.label));
        span.appendChild(document.createTextNode(c.valor));
        div.appendChild(span);
        contenido.appendChild(div);
    });

    sidebar.style.display = 'block';
}


// ============================================================
// BLOQUE 2 — Filtros
// ============================================================

// ── 2.1 Filtro por texto (nombre / marca / modelo / equipo) ──────────────────
//    Se combina con otros filtros en la función filtrar()

// ── 2.2 Poblar select con valores únicos de un campo ─────────────────────────
function rellenarSelect(items, campoValor, idSelect, textoDefault) {
    const valores = [...new Set(items.map(function (item) {
        return item[campoValor];
    }))].sort();

    const select = document.getElementById(idSelect);

    const optDefault = document.createElement('option');
    optDefault.value = '';
    optDefault.appendChild(document.createTextNode(textoDefault || 'Todos'));
    select.appendChild(optDefault);

    valores.forEach(function (v) {
        const opt = document.createElement('option');
        opt.value = v;
        opt.appendChild(document.createTextNode(v));
        select.appendChild(opt);
    });
}
// Uso: rellenarSelect(pilotos, 'nacionalidad', 'selectNacionalidad', 'Todas');
// Uso: rellenarSelect(coches,  'combustible',  'selectCombustible',  'Todos');

// ── 2.3 Poblar DOS selects de rango (Desde / Hasta) con el mismo campo ───────
function rellenarSelectsRango(items, campoValor, idDesde, idHasta) {
    const valores = [...new Set(items.map(function (item) {
        return item[campoValor];
    }))].sort();

    const selectDesde = document.getElementById(idDesde);
    const selectHasta = document.getElementById(idHasta);

    const optD = document.createElement('option');
    optD.value = '';
    optD.appendChild(document.createTextNode('Desde'));
    selectDesde.appendChild(optD);

    const optH = document.createElement('option');
    optH.value = '';
    optH.appendChild(document.createTextNode('Hasta'));
    selectHasta.appendChild(optH);

    valores.forEach(function (v) {
        const oD = document.createElement('option');
        oD.value = v;
        oD.appendChild(document.createTextNode(v));
        selectDesde.appendChild(oD);

        const oH = document.createElement('option');
        oH.value = v;
        oH.appendChild(document.createTextNode(v));
        selectHasta.appendChild(oH);
    });
}

// ── 2.4 Función filtrar — variante COCHES (año rango + km rango + cambio radio + combustible select + texto) ──
function filtrarCoches(todosLosItems) {
    const errorMensaje = document.getElementById('errorMensaje');
    limpiarNodos(errorMensaje);

    const anyoDesde   = document.getElementById('anyoDesde').value;
    const anyoHasta   = document.getElementById('anyoHasta').value;
    const kmDesde     = parseInt(document.getElementById('kmDesde').value) || 0;
    const kmHasta     = parseInt(document.getElementById('kmHasta').value) || Infinity;
    const cambio      = document.querySelector('input[name="cambio"]:checked').value;
    const combustible = document.getElementById('combustible').value;
    const texto       = document.getElementById('marcaModelo').value.toLowerCase().trim();

    // Validación rango año
    if (anyoDesde !== '' && anyoHasta !== '' && anyoDesde > anyoHasta) {
        errorMensaje.appendChild(document.createTextNode('El año Desde no puede ser mayor que el año Hasta.'));
        return;
    }
    // Validación rango km
    if (kmDesde > kmHasta) {
        errorMensaje.appendChild(document.createTextNode('Los km Desde no pueden ser mayores que los Hasta.'));
        return;
    }

    const resultado = todosLosItems.filter(function (item) {
        if (anyoDesde !== '' && item.anyo < anyoDesde) return false;
        if (anyoHasta !== '' && item.anyo > anyoHasta) return false;
        if (parseInt(item.km) < kmDesde) return false;
        if (parseInt(item.km) > kmHasta) return false;
        if (cambio !== '' && item.cambio !== cambio) return false;
        if (combustible !== '' && item.combustible !== combustible) return false;
        if (texto !== '') {
            const coincide = item.marca.toLowerCase().includes(texto) ||
                             item.modelo.toLowerCase().includes(texto);
            if (!coincide) return false;
        }
        return true;
    });

    pintarCards(resultado);
}

// ── 2.5 Función filtrar — variante PILOTOS (select única + texto nombre/equipo + ordenación) ──
function filtrarPilotos(todosLosItems) {
    const mensajeError = document.getElementById('mensajeSinResultados');

    const nacionalidad = document.getElementById('selectNacionalidad').value;
    const orden        = document.getElementById('selectOrden').value;
    const texto        = document.getElementById('inputBuscar').value.toLowerCase().trim();

    let resultado = todosLosItems.filter(function (item) {
        if (nacionalidad !== '' && item.nacionalidad !== nacionalidad) return false;
        if (texto !== '') {
            const enNombre = item.nombre.toLowerCase().includes(texto);
            const enEquipo = item.equipo.toLowerCase().includes(texto);
            if (!enNombre && !enEquipo) return false;
        }
        return true;
    });

    // Ordenación
    if (orden === 'nombre') {
        resultado.sort((a, b) => a.nombre.localeCompare(b.nombre));
    } else if (orden === 'campeonatos') {
        resultado.sort((a, b) => b.campeonatos - a.campeonatos);
    } else if (orden === 'dorsal') {
        resultado.sort((a, b) => a.dorsal - b.dorsal);
    }

    // Mensaje sin resultados
    if (resultado.length === 0) {
        mensajeError.style.display = 'block';
    } else {
        mensajeError.style.display = 'none';
    }

    pintarCards(resultado);
}

// ── 2.6 Filtro solo favoritos (toggle) ───────────────────────────────────────
//    Estado externo: let soloFavoritos = false;
function toggleFiltroFavoritos(todosLosItems, soloFavoritos, btnFav) {
    soloFavoritos = !soloFavoritos;

    if (soloFavoritos) {
        limpiarNodos(btnFav);
        btnFav.appendChild(document.createTextNode('Mostrar todos'));
        const ids = getFavoritos();
        const resultado = todosLosItems.filter(item => ids.includes(item.id || item.dorsal));
        const msg = document.getElementById('mensajeSinResultados');
        msg.style.display = resultado.length === 0 ? 'block' : 'none';
        pintarCards(resultado);
    } else {
        limpiarNodos(btnFav);
        btnFav.appendChild(document.createTextNode('Mostrar solo favoritos'));
        document.getElementById('mensajeSinResultados').style.display = 'none';
        pintarCards(todosLosItems);
    }

    return soloFavoritos; // hay que reasignar la variable en el scope padre
}

// ── 2.7 Reiniciar todos los filtros ──────────────────────────────────────────
function reiniciarFiltros(todosLosItems) {
    document.getElementById('inputBuscar').value = '';
    document.getElementById('selectNacionalidad').value = '';
    document.getElementById('selectOrden').value = '';
    document.getElementById('mensajeSinResultados').style.display = 'none';
    pintarCards(todosLosItems);
}


// ============================================================
// BLOQUE 3 — Ordenación
// ============================================================

// ── 3.1 Ordenar por precio ascendente ────────────────────────────────────────
function ordenarPrecioAsc(items) {
    return [...items].sort((a, b) => parseInt(a.precio) - parseInt(b.precio));
}

// ── 3.2 Ordenar por precio descendente ───────────────────────────────────────
function ordenarPrecioDesc(items) {
    return [...items].sort((a, b) => parseInt(b.precio) - parseInt(a.precio));
}

// ── 3.3 Ordenar alfabéticamente por campo string ─────────────────────────────
function ordenarPorNombre(items, campo) {
    return [...items].sort((a, b) => a[campo].localeCompare(b[campo]));
}

// ── 3.4 Ordenar numéricamente por campo ──────────────────────────────────────
function ordenarPorNumero(items, campo, desc) {
    return [...items].sort((a, b) => desc ? b[campo] - a[campo] : a[campo] - b[campo]);
}

// ── 3.5 Volver a orden original (relevancia) ─────────────────────────────────
//    Simplemente usar una copia del array original que guardamos en main()
//    cochesActuales = [...todosLosItems];


// ============================================================
// BLOQUE 4 — jQuery UI Autocomplete
// ============================================================

// ── 4.1 Variante simple: solo un campo (nombres, marcas) ─────────────────────
function iniciarAutocompleteSencillo(items, campoTexto, idInput, callbackFiltrar) {
    const sugerencias = [];
    const vistos = {};

    items.forEach(function (item) {
        const valor = item[campoTexto];
        if (!vistos[valor]) {
            vistos[valor] = true;
            sugerencias.push(valor);
        }
    });

    $('#' + idInput).autocomplete({
        source: sugerencias,
        select: function (event, ui) {
            $('#' + idInput).val(ui.item.value); // OBLIGATORIO asignar manualmente
            callbackFiltrar();
            return false;                        // OBLIGATORIO para evitar sobreescritura
        }
    });

    // Escuchar también escritura manual
    $('#' + idInput).on('input', function () {
        callbackFiltrar();
    });
}

// ── 4.2 Variante compuesta: marca + "marca modelo" (evitando duplicados) ──────
function iniciarAutocompleteDoble(items, idInput, callbackFiltrar) {
    const sugerencias = [];
    const vistos = {};

    items.forEach(function (item) {
        if (!vistos[item.marca]) {
            vistos[item.marca] = true;
            sugerencias.push(item.marca);
        }
        const marcaModelo = item.marca + ' ' + item.modelo;
        if (!vistos[marcaModelo]) {
            vistos[marcaModelo] = true;
            sugerencias.push(marcaModelo);
        }
    });

    $('#' + idInput).autocomplete({
        source: sugerencias,
        select: function (event, ui) {
            $('#' + idInput).val(ui.item.value);
            callbackFiltrar();
            return false;
        }
    });
}

// ── 4.3 Variante con nombre Y equipo (p.ej. pilotos) ─────────────────────────
function iniciarAutocompleteNombreEquipo(items, idInput, callbackFiltrar) {
    const sugerencias = [];
    const vistos = {};

    items.forEach(function (item) {
        [item.nombre, item.equipo].forEach(function (valor) {
            if (valor && !vistos[valor]) {
                vistos[valor] = true;
                sugerencias.push(valor);
            }
        });
    });

    $('#' + idInput).autocomplete({
        source: sugerencias,
        select: function (event, ui) {
            $('#' + idInput).val(ui.item.value);
            callbackFiltrar();
            return false;
        }
    });

    $('#' + idInput).on('input', function () {
        callbackFiltrar();
    });
}


// ============================================================
// BLOQUE 5 — Favoritos (toggle en localStorage)
// ============================================================

function toggleFavorito(id) {
    const favoritos = getFavoritos();
    const indice = favoritos.indexOf(id);

    if (indice === -1) {
        favoritos.push(id);     // añadir
    } else {
        favoritos.splice(indice, 1); // quitar
    }

    setFavoritos(favoritos);
}
// Uso típico (delegación de eventos):
// contenedor.addEventListener('click', function(e) {
//     if (e.target.classList.contains('btn-fav')) {
//         const id = parseInt(e.target.dataset.id);
//         toggleFavorito(id);
//         pintarCards(todosLosItems);
//     }
// });


// ============================================================
// BLOQUE 6 — Pasar datos entre páginas (query string)
// ============================================================

// ── 6.1 Leer parámetro de la URL ─────────────────────────────────────────────
function getParamUrl(nombre) {
    const params = new URLSearchParams(window.location.search);
    return params.get(nombre); // devuelve string o null
}

// ── 6.2 Uso típico en página de detalle / reserva ─────────────────────────────
async function mainDetalle() {
    const response = await fetch('bbdd.json');
    const json = await response.json();

    const id = parseInt(getParamUrl('id'));
    const item = json.cars[id]; // o json.items.find(...)

    if (!item) {
        window.location.href = 'index.html'; // redirigir si no existe
        return;
    }

    // Pintar datos del item en la página de detalle
    const titulo = document.querySelector('.card-title');
    titulo.appendChild(document.createTextNode(item.marca + ' ' + item.modelo));
    // ...etc
}

// ── 6.3 Uso típico en modo alta / edición de formulario ───────────────────────
//    URL: formulario.html         → modo ALTA (idEdicion = null)
//    URL: formulario.html?id=123  → modo EDICIÓN
function detectarModoFormulario(items) {
    const idEdicion = getParamUrl('id');

    if (idEdicion) {
        // Cambiar título
        const titulo = document.getElementById('tituloFormulario');
        limpiarNodos(titulo);
        titulo.appendChild(document.createTextNode('Editar'));

        // Precargar datos
        const item = items.find(i => i.id === parseInt(idEdicion));
        if (item) precargarFormulario(item);
    }

    return idEdicion; // null = alta, string = edición
}


// ============================================================
// BLOQUE 7 — Validaciones de formulario
// ============================================================

// ── EXPRESIONES REGULARES MÁS COMUNES ────────────────────────────────────────
const REGEX = {
    // Texto general (letras, espacios, acentos)
    nombre:       /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,50}$/,
    // Email — versión compatible (sin lookbehind ni unicode)
    email:        /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/,
    // Teléfono formato (999) 666-333
    telefono:     /^\(\d{3}\)\s\d{3}-\d{3}$/,
    // DNI: 8 dígitos + letra mayúscula O 9 dígitos + letra (según enunciado)
    dni:          /^\d{8}[A-Z]$/,
    // CIF: letra mayúscula + 8 dígitos
    cif:          /^[A-Z]\d{8}$/,
    // NIE: X + 7 dígitos + letra
    nie:          /^X\d{7}[A-Z]$/,
    // Código país 3 letras mayúsculas (p.ej. ESP, ITA)
    codigoPais:   /^[A-Z]{3}$/,
    // Fecha dd/mm/aaaa
    fecha:        /^\d{2}\/\d{2}\/\d{4}$/,
    // URL de imagen
    urlImagen:    /^(https?:\/\/.+|.+\.(jpg|jpeg|png|webp|gif))$/i,
    // Solo números enteros positivos
    enteroPos:    /^\d+$/,
    // Importe decimal positivo
    importe:      /^\d+(\.\d{1,2})?$/,
};

// ── 7.1 Patrón acumular errores + mostrarlos ──────────────────────────────────
function validarFormularioGenerico() {
    const errores = [];

    const nombre = document.getElementById('inputNombre').value.trim();
    if (nombre === '') {
        errores.push('El nombre es obligatorio.');
    } else if (!REGEX.nombre.test(nombre)) {
        errores.push('El nombre solo puede contener letras (2-50 caracteres).');
    }

    const email = document.getElementById('inputEmail').value.trim();
    if (email === '') {
        errores.push('El email es obligatorio.');
    } else if (!REGEX.email.test(email)) {
        errores.push('El formato del email no es válido.');
    }

    const telefono = document.getElementById('inputTelefono').value.trim();
    if (telefono === '') {
        errores.push('El teléfono es obligatorio.');
    } else if (!REGEX.telefono.test(telefono)) {
        errores.push('El teléfono debe tener el formato (999) 666-333.');
    }

    // Checkbox
    const aceptar = document.getElementById('aceptar').checked;
    if (!aceptar) {
        errores.push('Debes aceptar las condiciones de uso.');
    }

    mostrarErrores(errores);
    return errores.length === 0; // true = formulario válido
}

// ── 7.2 DNI / CIF / NIE (al menos uno válido) ────────────────────────────────
function validarDocumento(valor) {
    return REGEX.dni.test(valor) || REGEX.cif.test(valor) || REGEX.nie.test(valor);
}

// ── 7.3 Validar fecha real (no solo formato) ──────────────────────────────────
function validarFecha(fecha) {
    if (!REGEX.fecha.test(fecha)) return false;
    const partes = fecha.split('/');
    const dia  = parseInt(partes[0], 10);
    const mes  = parseInt(partes[1], 10) - 1;
    const anyo = parseInt(partes[2], 10);
    const d = new Date(anyo, mes, dia);
    return d.getFullYear() === anyo && d.getMonth() === mes && d.getDate() === dia;
}

// ── 7.4 Patrón setCustomValidity + checkValidity (para inputs con atributos HTML) ──
//    El input en HTML tiene: required, min, max, minlength, maxlength
function validarConCheckValidity() {
    let formularioValido = true;

    const inputAnyo = document.getElementById('inputAnyo');
    inputAnyo.setCustomValidity(''); // limpiar estado anterior
    if (!inputAnyo.checkValidity()) {
        mostrarError('errorAnyo', 'El año debe estar entre 1970 y 2010.');
        formularioValido = false;
    } else {
        ocultarError('errorAnyo');
    }

    // Combinación: regex custom + checkValidity
    const inputNombre = document.getElementById('inputNombre');
    inputNombre.setCustomValidity('');
    if (!REGEX.nombre.test(inputNombre.value.trim())) {
        inputNombre.setCustomValidity('Formato incorrecto'); // activa checkValidity
    }
    if (!inputNombre.checkValidity()) {
        mostrarError('errorNombre', 'El nombre solo puede contener letras (2-50 caracteres).');
        formularioValido = false;
    } else {
        ocultarError('errorNombre');
    }

    return formularioValido;
}

// ── Helpers para mostrar / ocultar errores ────────────────────────────────────

// Variante A: errores en párrafos dentro de un contenedor (lista de errores)
function mostrarErrores(errores) {
    const contenedor = document.getElementById('mensajesError');
    limpiarNodos(contenedor);
    errores.forEach(function (mensaje) {
        const p = document.createElement('p');
        p.appendChild(document.createTextNode(mensaje));
        contenedor.appendChild(p);
    });
}

// Variante B: error individual junto a cada campo
function mostrarError(idElemento, mensaje) {
    const p = document.getElementById(idElemento);
    limpiarNodos(p);
    p.appendChild(document.createTextNode(mensaje));
}
function ocultarError(idElemento) {
    limpiarNodos(document.getElementById(idElemento));
}


// ============================================================
// BLOQUE 8 — CRUD completo sobre localStorage
// ============================================================

// ── 8.1 Añadir item (modo ALTA) ───────────────────────────────────────────────
function altaItem(datosFormulario) {
    const items = getItems();
    datosFormulario.id = Date.now(); // id único
    items.push(datosFormulario);
    setItems(items);
    window.location.href = 'index.html';
}

// ── 8.2 Editar item (modo EDICIÓN) ───────────────────────────────────────────
function editarItem(datosFormulario, idEdicion) {
    const items = getItems();
    const indice = items.findIndex(i => i.id === parseInt(idEdicion));
    if (indice !== -1) {
        datosFormulario.id = parseInt(idEdicion); // conservar id original
        items[indice] = datosFormulario;
    }
    setItems(items);
    window.location.href = 'index.html';
}

// ── 8.3 Borrar item ───────────────────────────────────────────────────────────
function borrarItem(indice) {
    const confirmado = confirm('¿Estás seguro de que quieres eliminar este elemento?');
    if (!confirmado) return;
    const items = getItems();
    items.splice(indice, 1);
    setItems(items);
    pintarCards(items);
}

// ── 8.4 Leer formulario → objeto (adaptar campos según examen) ────────────────
function leerFormulario() {
    return {
        nombre:       document.getElementById('inputNombre').value.trim(),
        apellidos:    document.getElementById('inputApellidos').value.trim(),
        email:        document.getElementById('inputEmail').value.trim(),
        telefono:     document.getElementById('inputTelefono').value.trim(),
        anyo:         parseInt(document.getElementById('inputAnyo').value),
        // booleano desde checkbox:
        aceptado:     document.getElementById('aceptar').checked,
        // número con fallback a 0:
        campeonatos:  parseInt(document.getElementById('inputCampeonatos').value) || 0,
    };
}

// ── 8.5 Precargar formulario con datos existentes (modo edición) ──────────────
function precargarFormulario(item) {
    document.getElementById('inputNombre').value    = item.nombre;
    document.getElementById('inputApellidos').value = item.apellidos;
    document.getElementById('inputEmail').value     = item.email;
    document.getElementById('inputTelefono').value  = item.telefono;
    document.getElementById('inputAnyo').value      = item.anyo;
}

// ── 8.6 Guardar reserva (objeto anidado coche + cliente) ──────────────────────
function guardarReservaCompleta(item, datosCliente) {
    const reserva = {
        item: item,
        cliente: {
            nombreApellidos: datosCliente.nombre,
            dniCifNia:       datosCliente.dni,
            email:           datosCliente.email,
            telefono:        datosCliente.telefono,
            nota:            datosCliente.nota,
        }
    };
    localStorage.setItem('reserva', JSON.stringify(reserva));
    window.location.href = 'index.html';
}


// ============================================================
// BLOQUE 9 — Cálculo de saldo (variante libro contable)
// ============================================================

function calcularSaldo(apuntes) {
    return apuntes.reduce(function (acumulado, apunte) {
        return apunte.dh === 'H'
            ? acumulado + apunte.importe
            : acumulado - apunte.importe;
    }, 0);
}

// ── Pintar tabla con saldo acumulado fila a fila ──────────────────────────────
function pintarTablaContable(apuntes) {
    const cuerpo = document.getElementById('cuerpoTabla');
    limpiarNodos(cuerpo);

    let saldoAcumulado = 0;

    apuntes.forEach(function (apunte, indice) {
        saldoAcumulado += apunte.dh === 'H' ? apunte.importe : -apunte.importe;
        const fila = crearFila(apunte, saldoAcumulado, indice);
        cuerpo.appendChild(fila);
    });

    const saldoEl = document.getElementById('saldoActual');
    limpiarNodos(saldoEl);
    saldoEl.appendChild(document.createTextNode(saldoAcumulado.toFixed(2)));
}


// ============================================================
// BLOQUE 10 — Delegación de eventos (event delegation)
// ============================================================

// ── Patrón general: un listener en el contenedor para múltiples botones ───────
//    Evita añadir listeners en cada card individualmente.
//
//    document.getElementById('contenedor').addEventListener('click', function(e) {
//
//        // Botón ver ficha
//        if (e.target.classList.contains('btn-ficha')) {
//            const id = parseInt(e.target.dataset.id);
//            const item = todosLosItems.find(i => i.id === id) || todosLosItems[id];
//            mostrarPanel(item);
//        }
//
//        // Botón favorito
//        if (e.target.classList.contains('btn-fav')) {
//            const id = parseInt(e.target.dataset.id);
//            toggleFavorito(id);
//            pintarCards(todosLosItems);
//        }
//
//        // Botón borrar (tabla)
//        if (e.target.classList.contains('btn-borrar')) {
//            const indice = parseInt(e.target.dataset.indice);
//            borrarItem(indice);
//        }
//    });


// ============================================================
// BLOQUE 11 — Formatos y utilidades menores
// ============================================================

// ── Formatear número con separador de miles español ───────────────────────────
function formatearNumero(valor) {
    return parseInt(valor).toLocaleString('es-ES');
}
// Uso: formatearNumero(coche.precio) → "159.999"
// Uso: formatearNumero(coche.km)     → "19.000"

// ── Añadir texto con unidad ───────────────────────────────────────────────────
// el.appendChild(document.createTextNode(formatearNumero(item.precio) + ' €'));
// el.appendChild(document.createTextNode(formatearNumero(item.km) + ' Km.'));

// ── Validar que un select D/H está seleccionado ───────────────────────────────
function validarDH(valor) {
    return valor === 'D' || valor === 'H';
}

// ── Validar importe positivo ──────────────────────────────────────────────────
function validarImporte(valor) {
    const n = parseFloat(valor);
    return !isNaN(n) && n > 0;
}

// ── Obtener valor de radio button por nombre ──────────────────────────────────
// document.querySelector('input[name="cambio"]:checked').value

// ── Establecer display de un elemento ────────────────────────────────────────
// elemento.style.display = 'block';   // mostrar
// elemento.style.display = 'none';    // ocultar


// ============================================================
// REFERENCIA RÁPIDA — querySelector más usados
// ============================================================
//
//  Por id:              document.getElementById('miId')
//  Por clase:           document.querySelector('.miClase')
//  Por etiqueta+clase:  document.querySelector('input.btn-fav')
//  Radio checked:       document.querySelector('input[name="grupo"]:checked')
//  Todos por clase:     document.querySelectorAll('.btn-borrar')
//  Primer <strong>:     document.querySelectorAll('strong')[0]
//  Padre del target:    e.target.closest('.card')
//
//  Dataset (guardar datos en HTML):
//    btn.dataset.id = item.id;              // escribir
//    parseInt(e.target.dataset.id)          // leer (siempre string → parsear)
//
//  Clases:
//    el.classList.add('activo')
//    el.classList.remove('activo')
//    el.classList.contains('activo')        // boolean
//    el.classList.toggle('activo')          // añade si no está, quita si está