// ============================================================
// Hem d'esperar que tot l'HTML i el DOM estiguen completament
// carregats abans d'executar el nostre codi.
// "DOMContentLoaded" s'activa quan el navegador ha construït
// l'arbre DOM, sense esperar imatges o fulls d'estil.
// ============================================================
document.addEventListener('DOMContentLoaded', main);

// ============================================================
// Variables globals (accessibles des de qualsevol funció)
// ============================================================
let jugadores = [];           // Tots els jugadors carregats del JSON original
let jugadoresOriginal = [];   // Còpia immutable per restaurar "rellevància"
let ordenActual = 'relevancia'; // Estat d'ordenació actual ('relevancia', 'asc', 'desc')

/**
 * Funció principal que arranca tota l'aplicació.
 * Es crida una sola vegada, després del DOMContentLoaded.
 * S'encarrega de:
 *   - Carregar les dades des de jugadores.json amb fetch (async/await)
 *   - Configurar l'autocomplete de jQuery UI
 *   - Omplir els selectors d'edat amb valors únics
 *   - Assignar els events de filtrat, ordenació i neteja
 *   - Mostrar la llista completa de jugadors en pantalla
 */
async function main() {
    try {
        // Fem una petició GET al fitxer JSON local
        const respuesta = await fetch('jugadores.json');

        // Si la resposta no és correcta (per exemple 404), llancem error
        if (!respuesta.ok) throw new Error('Error al cargar jugadores.json');

        // Convertim la resposta en un array d'objectes JavaScript
        jugadores = await respuesta.json();

        // Guardem una còpia exacta amb l'operador spread (...) per tindre
        // sempre l'ordre original sense modificar-lo.
        // Exemple alternatiu: jugadoresOriginal = Array.from(jugadores);
        jugadoresOriginal = [...jugadores];

        // Cridem les funcions de configuració de la interfície
        configurarAutocomplete();
        rellenarSelectsEdad();
        configurarEventosFiltros();
        configurarBotonesOrdenacion();

        // Mostrem tots els jugadors la primera vegada
        mostrarJugadores(jugadores);

    } catch (error) {
        // Si alguna cosa falla (problema de xàrxa, JSON mal format...)
        console.error('Error al inicializar:', error);
        // Informem l'usuari dins de la zona de llistat
        document.getElementById('listado').innerHTML =
            '<div class="alert alert-danger">Error al cargar los datos de jugadores.</div>';
    }
}

// ============================================================
// CONFIGURACIÓ DEL AUTOCOMPLETE (jQuery UI)
// ============================================================
/**
 * Configura el widget autocomplete sobre l'input#nombreBusqueda.
 * La font de suggeriments són tots els noms del array "jugadores".
 * S'activa a partir que l'usuari escriu almenys 2 caràcters.
 *
 * Alternatives que el professor podria demanar:
 *   - Buscar per posició, dorsal o nacionalitat en lloc de nom.
 *     Exemple: extraure dorsals únics i usar-los com a source.
 *   - Utilitzar una funció de filtrat personalitzada:
 *     source: function(request, response) {
 *        const term = request.term.toLowerCase();
 *        response(jugadores.filter(j => j.nombre.toLowerCase().includes(term)).map(j => j.nombre));
 *     }
 *   - Mostrar també la posició o la imatge al costat del suggeriment
 *     amb _renderItem.
 */
function configurarAutocomplete() {
    // Extraiem només els noms (strings) de tots els jugadors
    const nombres = jugadores.map(j => j.nombre);

    // Inicialitzem l'autocomplete de jQuery UI
    $('#nombreBusqueda').autocomplete({
        source: nombres,    // la llista de paraules que apareixerà
        minLength: 2        // no mostra suggeriments fins que hi haja 2 caràcters
    });
}

// ============================================================
// SELECTORS D'EDAT DINÀMICS
// ============================================================
/**
 * Omple els <select id="edadDesde" i "edadHasta"> amb les edats
 * úniques dels jugadors, ordenades de menor a major.
 * Per defecte selecciona el rang complet (mínim i màxim).
 *
 * Alternatives que podria preguntar el professor:
 *   - Fer el mateix per a qualsevol altre camp numèric (ex: partits, gols, valor).
 *   - Afegir un placeholder inicial "Des de..." amb value="" i deshabilitat.
 *   - Utilitzar document.createElement('option') en lloc de innerHTML.
 */
function rellenarSelectsEdad() {
    // 1. Obtenim un array d'edats úniques amb Set i el destructurem
    //    Després ordenem numèricament amb sort((a,b) => a - b)
    const edades = [...new Set(jugadores.map(j => j.edad))].sort((a, b) => a - b);

    // 2. Referències als elements select
    const desde = document.getElementById('edadDesde');
    const hasta = document.getElementById('edadHasta');

    // 3. Netegem qualsevol opció anterior (per si recarreguem filtres)
    desde.innerHTML = '';
    hasta.innerHTML = '';

    // 4. Creem les opcions per als dos selects
    edades.forEach(edad => {
        // Amb innerHTML construïm les etiquetes <option>
        // Atenció: si les dades vingueren d'una API no segura millor usar createElement
        desde.innerHTML += `<option value="${edad}">${edad}</option>`;
        hasta.innerHTML += `<option value="${edad}">${edad}</option>`;
    });

    // 5. Seleccionem per defecte el mínim en "desde" i el màxim en "hasta"
    if (edades.length > 0) {
        desde.value = edades[0];
        hasta.value = edades[edades.length - 1];
    }
}

// ============================================================
// ASSIGNACIÓ D'EVENTS DELS FILTRES
// ============================================================
/**
 * Registra els esdeveniments per als botons de cerca, aplicar filtres
 * i eliminar filtres.
 *
 * Observacions per al professor:
 *   - El botó "Ir!" fa el mateix que el submit del formulari: crida aplicarFiltros()
 *   - Eliminar filtres fa un reset complet i torna a l'ordre original (rellevància)
 *   - Es podria afegir validació "en calent" mentre l'usuari canvia els selects
 *     amb l'esdeveniment 'change', per a una experiència més dinàmica.
 */
function configurarEventosFiltros() {
    // Botó "Ir!" al costat del cercador
    document.getElementById('ir').addEventListener('click', () => {
        aplicarFiltros();
    });

    // Quan es prem el botó "Aplicar" dins del formulari
    document.getElementById('formFiltros').addEventListener('submit', (e) => {
        e.preventDefault(); // Evita que la pàgina es recarregue
        aplicarFiltros();
    });

    // Botó "Eliminar filtros" (tipus reset però fem gestió manual)
    document.getElementById('eliminarFiltro').addEventListener('click', () => {
        // Netegem el camp de text del autocomplete
        document.getElementById('nombreBusqueda').value = '';

        // Tornem a omplir els selects d'edat amb els valors per defecte (rang complet)
        rellenarSelectsEdad();

        // Restaurem els selects de partits als valors inicials definits a l'HTML
        document.getElementById('partidosDesde').value = '0';
        document.getElementById('partidosHasta').value = '500';

        // Seleccionem el radiobutton "Totes" (value="")
        const radioTodas = document.querySelector('input[name="posicion"][value=""]');
        if (radioTodas) radioTodas.checked = true;

        // El select de nacionalitat el posem en "Totes"
        document.getElementById('nacionalidad').value = '';

        // Esborrem qualsevol missatge d'error actiu
        document.getElementById('errorMensaje').textContent = '';

        // Tornem a ordenar per rellevància
        ordenActual = 'relevancia';

        // Restaurem la llista original sense cap filtre
        jugadores = [...jugadoresOriginal];
        mostrarJugadores(jugadores);
    });
}

// ============================================================
// BOTONS D'ORDENACIÓ
// ============================================================
/**
 * Assigna els events als tres botons d'ordenació.
 * Cada botó canvia l'estat global 'ordenActual' i després
 * aplica els filtres (que internament també ordenaran).
 *
 * Nota: L'ordenació es manté encara que es canvien els filtres,
 *       perquè la funció aplicarFiltros() usa la variable 'ordenActual'.
 *
 * Possibles ampliacions:
 *   - Canviar la icona o color del botó actiu per indicar l'ordenació actual.
 *   - Ordenar per altres camps (edat, partits, gols) amb botons extra.
 */
function configurarBotonesOrdenacion() {
    // Rellevància = ordre en què estan al JSON original
    document.getElementById('relevancia').addEventListener('click', () => {
        ordenActual = 'relevancia';
        aplicarFiltros(); // Torna al ordre original i aplica filtres existents
    });

    // Preu més alt (valor descendent)
    document.getElementById('precioAlto').addEventListener('click', () => {
        ordenActual = 'desc';
        aplicarFiltros();
    });

    // Preu més baix (valor ascendent)
    document.getElementById('precioBajo').addEventListener('click', () => {
        ordenActual = 'asc';
        aplicarFiltros();
    });
}

// ============================================================
// APLICACIÓ DE FILTRES COMBINATS
// ============================================================
/**
 * Llig tots els valors dels filtres, valida que els rangs
 * siguen coherents (desde <= hasta) i després filtra el
 * array 'jugadoresOriginal' pas a pas.
 * Finalment ordena el resultat i l'assigna a la variable global
 * 'jugadores' perquè la vista siga consistent.
 *
 * El professor podria demanar:
 *   - Fer que la cerca per autocomplete també siga combinada amb filtres.
 *   - Implementar filtrat per múltiples paraules (ex: "Villa Argentina").
 *   - Que el filtrat es faça sobre l'array ja filtrat prèviament en lloc
 *     de sempre sobre l'original (comportament acumulatiu).
 */
function aplicarFiltros() {
    // ------------------------------------------------------------------
    // 1. OBTENIR VALORS DELS FORMULARIS
    // ------------------------------------------------------------------
    const nombre = document.getElementById('nombreBusqueda').value.trim().toLowerCase();
    const edadDesde = parseInt(document.getElementById('edadDesde').value);
    const edadHasta = parseInt(document.getElementById('edadHasta').value);
    const pDesde = parseInt(document.getElementById('partidosDesde').value);
    const pHasta = parseInt(document.getElementById('partidosHasta').value);
    const posicion = document.querySelector('input[name="posicion"]:checked').value;
    const nacionalidad = document.getElementById('nacionalidad').value;

    // ------------------------------------------------------------------
    // 2. VALIDACIÓ DE RANGS
    // ------------------------------------------------------------------
    // Cas edat: desde no pot ser major que hasta
    if (edadDesde > edadHasta) {
        document.getElementById('errorMensaje').textContent =
            'La edad "desde" no puede ser mayor que "hasta".';
        return; // Eixim de la funció sense aplicar cap canvi
    }

    // Cas partits: des de no pot ser major que hasta
    if (pDesde > pHasta) {
        document.getElementById('errorMensaje').textContent =
            'Los partidos "desde" no pueden ser mayores que "hasta".';
        return;
    }

    // Si no hi ha error netegem el missatge
    document.getElementById('errorMensaje').textContent = '';

    // ------------------------------------------------------------------
    // 3. FILTRAR SOBRE UNA CÒPIA DE TOTES LES DADES ORIGINALS
    // ------------------------------------------------------------------
    // Utilitzem l'array original perquè els filtres s'apliquen simultàniament
    // i no de forma acumulativa sobre resultats anteriors.
    let resultado = [...jugadoresOriginal];

    // Filtre per nom (si l'usuari ha escrit alguna cosa)
    if (nombre !== '') {
        resultado = resultado.filter(j =>
            j.nombre.toLowerCase().includes(nombre)
        );
    }

    // Filtre per rang d'edat
    resultado = resultado.filter(j =>
        j.edad >= edadDesde && j.edad <= edadHasta
    );

    // Filtre per rang de partits jugats
    resultado = resultado.filter(j =>
        j.partidos >= pDesde && j.partidos <= pHasta
    );

    // Filtre per posició (si no és la opció buida "Todas")
    if (posicion !== '') {
        resultado = resultado.filter(j => j.posicion === posicion);
    }

    // Filtre per nacionalitat (si no és "Todas")
    if (nacionalidad !== '') {
        resultado = resultado.filter(j => j.nacionalidad === nacionalidad);
    }

    // ------------------------------------------------------------------
    // 4. ORDENAR EL RESULTAT SEGONS L'ESTAT ACTUAL
    // ------------------------------------------------------------------
    ordenarJugadores(resultado);

    // Actualitzem la variable global 'jugadores' amb el resultat filtrat
    // per si des d'algun altre lloc es necessita consultar l'estat actual.
    jugadores = resultado;

    // ------------------------------------------------------------------
    // 5. MOSTRAR EN PANTALLA
    // ------------------------------------------------------------------
    mostrarJugadores(resultado);
}

// ============================================================
// FUNCIÓ D'ORDENACIÓ
// ============================================================
/**
 * Ordena un array de jugadors in-place (modifica l'array original)
 * segons la variable global 'ordenActual'.
 *
 * - 'asc'  -> valor de mercat de menor a major
 * - 'desc' -> valor de mercat de major a menor
 * - 'relevancia' -> no es fa res, es respecta l'ordre en què arriba
 *
 * Exemple d'extensió: ordenar per més d'un criteri,
 * primer per posició i després per valor.
 */
function ordenarJugadores(lista) {
    if (ordenActual === 'asc') {
        // sort amb funció de comparació numèrica ascendent
        lista.sort((a, b) => a.valor - b.valor);
    } else if (ordenActual === 'desc') {
        lista.sort((a, b) => b.valor - a.valor);
    }
    // Si ordenActual és 'relevancia' no fem cap ordenació.
}

// ============================================================
// MOSTRAR TARGETES DE JUGADORS (GENERACIÓ DINÀMICA D'HTML)
// ============================================================
/**
 * Construeix i insereix el codi HTML de cada targeta de jugador
 * dins del contenidor #listado.
 * Mostra: imatge, nom, posició, dorsal, valor, edat, partits, gols, nacionalitat
 * i un botó "Reservar" que envia a reserva.html passant l'id del jugador seleccionat.
 *
 * Comentaris didàctics:
 *  - Utilitza template literals (backticks) per interpolar valors.
 *  - El botó "Reservar" guarda l'objecte jugador sencer a localStorage
 *    en lloc de passar-lo per URL (més segur i net).
 *  - Si la llista està buida mostra un missatge d'avís.
 *
 * Possibles preguntes del professor:
 *  - Com canviaries per mostrar una graella de 3 columnes amb Bootstrap?
 *  - Com es podria fer per a que les imatges tinguen un placeholder si fallen?
 *    (ex: onerror="this.src='img/placeholder.jpg'")
 *  - Com evitar la injecció de codi si les dades vingueren d'una font no fiable?
 *    (caldria sanititzar el text amb textContent en lloc de innerHTML)
 */
function mostrarJugadores(lista) {
    const contenedor = document.getElementById('listado');

    // Cas especial: cap jugador compleix els filtres
    if (lista.length === 0) {
        contenedor.innerHTML = '<div class="alert alert-warning">No se encontraron jugadores con esos criterios.</div>';
        return;
    }

    let html = '';
    // Recórrer tots els jugadors que cal mostrar
    lista.forEach(jugador => {
        // Creem una targeta (card) de Bootstrap per a cada jugador
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
                    <!-- L'atribut data-id guarda l'identificador sense necessitat de classes extra -->
                    <button class="btn btn-danger btn-reservar" data-id="${jugador.id}">Reservar</button>
                </div>
            </div>
        </div>`;
    });

    // Inserim tot l'HTML generat dins del contenidor
    contenedor.innerHTML = html;

    // ---------------------------------------------------------
    // Assignem manualment l'esdeveniment click a cada botó "Reservar"
    // Perquè no podem posar 'onclick' en l'HTML (el professor vol separació)
    // ---------------------------------------------------------
    document.querySelectorAll('.btn-reservar').forEach(boton => {
        boton.addEventListener('click', (e) => {
            // Obtenim l'id guardat a data-id
            const id = parseInt(e.target.dataset.id);
            // Busquem l'objecte jugador complet dins de l'array global 'jugadores'
            // Nota: busquem en 'jugadores' (resultat filtrat) per si de cas.
            // També podríem buscar en jugadoresOriginal.
            const jugadorSeleccionado = jugadores.find(j => j.id === id);

            if (jugadorSeleccionado) {
                // Guardem l'objecte jugador en localStorage com a text JSON
                // La clau pot ser la que vulguem; ací usem 'jugadorSeleccionado'.
                localStorage.setItem('jugadorSeleccionado', JSON.stringify(jugadorSeleccionado));

                // Redirigim a la pàgina de reserva
                window.location.href = 'reserva.html';
            } else {
                // Per si hi haguera cap error inesperat
                alert('No se ha encontrado el jugador seleccionado.');
            }
        });
    });
}