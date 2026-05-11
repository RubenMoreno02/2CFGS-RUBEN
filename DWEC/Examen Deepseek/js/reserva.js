// ============================================================
// Igual que a index.js, esperem que tot el DOM estiga carregat
// abans d'executar el nostre codi.
// ============================================================
document.addEventListener('DOMContentLoaded', main);

/**
 * Funció principal de la pàgina de reserva.
 * S'executa només una vegada i:
 *  1. Carrega les dades del jugador que vé del localStorage.
 *  2. Configura la validació del formulari del client.
 */
function main() {
    cargarDatosJugador();
    configurarValidacionFormulario();
}

// ============================================================
// CARREGAR DADES DEL JUGADOR A LA PÀGINA DE RESERVA
// ============================================================
/**
 * Recupera l'objecte 'jugadorSeleccionado' del localStorage,
 * el convertix de text JSON a objecte JavaScript i l'utilitza
 * per a omplir els elements HTML de la targeta del jugador.
 *
 * ATENCIÓ: No podem afegir identificadors (id, classes extra)
 * al HTML de reserva.html. Per això fem servir mètodes de
 * selecció basats en l'estructura actual (querySelector,
 * querySelectorAll) sense modificar les etiquetes originals.
 *
 * Alternatives que podria demanar el professor:
 *  - Si el disseny canvia, haurem de refer la funció perquè
 *    els selectors CSS depenen de l'estructura exacta del HTML.
 *  - Pasar les dades per la URL amb query parameters i llegir-les
 *    amb URLSearchParams en lloc de localStorage.
 *  - Utilitzar sessionStorage en lloc de localStorage si les dades
 *    només han de viure durant la sessió actual.
 *  - Comprovar que les dades del jugador siguen vàlides abans
 *    d'omplir-les (per evitar errors si el JSON està corrupte).
 */
function cargarDatosJugador() {
    // Obtenim la cadena JSON guardada amb clau 'jugadorSeleccionado'
    const jugadorGuardado = localStorage.getItem('jugadorSeleccionado');

    // Si no hi ha dades (l'usuari ha entrat directament a reserva.html)
    // mostrem un avís i un enllaç per tornar a l'inici.
    if (!jugadorGuardado) {
        document.getElementById('listado').innerHTML =
            '<div class="alert alert-warning">No se ha seleccionado ningún jugador. <a href="index.html">Volver al inicio</a></div>';
        return; // eixim perquè no tenim res a carregar
    }

    // Parsegem el text JSON a un objecte JavaScript
    const jugador = JSON.parse(jugadorGuardado);

    // ---------------------------------------------------------
    // Omplir la imatge
    // ---------------------------------------------------------
    // Busquem la primera imatge dins de #listado amb la classe .card-img-top
    const img = document.querySelector('#listado .card-img-top');
    if (img) {
        img.src = jugador.img;
        img.alt = jugador.nombre; // text alternatiu accessible
    }

    // ---------------------------------------------------------
    // Omplir el nom del jugador (títol de la targeta)
    // ---------------------------------------------------------
    const titulo = document.querySelector('#listado .card-title');
    if (titulo) titulo.textContent = jugador.nombre;

    // ---------------------------------------------------------
    // Omplir el valor de mercat (caixa groga amb bg-warning)
    // ---------------------------------------------------------
    // Busquem l'element h2 que està dins d'un contenidor amb classe .bg-warning
    const valorDiv = document.querySelector('#listado .bg-warning h2');
    if (valorDiv) valorDiv.textContent = `${jugador.valor}M€`;

    // ---------------------------------------------------------
    // Omplir les estadístiques (els 4 <strong>)
    // ---------------------------------------------------------
    // L'HTML original (heretat del examen) mostra les etiquetes:
    //   <div class="col p-3 text-center border-bottom border-dark">Año</div>
    //   <div class="col p-3 text-center border-bottom border-dark">Kilometros</div>
    //   <div class="col p-3 text-center border-bottom border-dark">Cambio</div>
    //   <div class="col p-3 text-center border-bottom border-dark">Combustible</div>
    //   ...
    //   <div class="col p-3 text-center"><strong></strong></div> (x4)
    //
    // Per a nosaltres:
    //   Año (edat)       -> jugador.edad
    //   Kilometros       -> jugador.partidos
    //   Cambio (posició) -> jugador.posicion
    //   Combustible      -> jugador.nacionalidad
    //
    // Seleccionem tots els <strong> que estan dins d'una columna
    // amb les classes .col, .p-3, .text-center, i que no tinguen
    // les vores de la capçalera (per això no usem .border-bottom).
    // 
    // Pista per al professor: Si el disseny HTML canvia, aquesta
    // selecció pot trencar-se. Una alternativa seria seleccionar
    // tots els <strong> dins de #listado i assignar els valors per
    // índex de manera cega, però és menys robust.
    const strongs = document.querySelectorAll('#listado .row .col.p-3.text-center strong');
    
    if (strongs.length >= 4) {
        strongs[0].textContent = jugador.edad;         // "Año" -> Edad
        strongs[1].textContent = jugador.partidos;     // "Kilometros" -> Partidos
        strongs[2].textContent = jugador.posicion;     // "Cambio" -> Posición
        strongs[3].textContent = jugador.nacionalidad; // "Combustible" -> Nacionalidad
    }
}

// ============================================================
// VALIDACIÓ DEL FORMULARI DE CLIENT I ENVIAMENT
// ============================================================
/**
 * Captura l'esdeveniment submit del formulari #formReserva,
 * valida tots els camps amb JavaScript (a més de la validació
 * HTML5 que ja porten els atributs required i pattern) i
 * mostra els errors en un únic lloc (#errorMensaje).
 *
 * Si tot és correcte construeix un objecte 'reserva' amb les
 * dades del jugador i del client, el guarda al localStorage
 * i redirigeix a la pàgina principal (index.html).
 *
 * Coses que el professor podria preguntar o demanar canviar:
 *  - Utilitzar l'API de validació de HTML5 (checkValidity,
 *    setCustomValidity) en lloc de comprovar manualment cada
 *    camp. Així els missatges eixirien com a bombolles del
 *    navegador.
 *  - Fer que el desament al localStorage siga acumulatiu
 *    (guarda una llista de reserves).
 *  - Obtindre els valors del formulari amb FormData en lloc
 *    d'agafar un per un.
 *  - Afegir una confirmació amb confirm() abans d'enviar.
 *  - Validar el DNI amb l'algorisme de la lletra, no només
 *    amb l'expressió regular (més avançat).
 */
function configurarValidacionFormulario() {
    const formulario = document.getElementById('formReserva');
    const errorMensaje = document.getElementById('errorMensaje');

    // Quan l'usuari faça clic al botó "Enviar" (submit):
    formulario.addEventListener('submit', (e) => {
        // Evitem que el formulari s'envie de manera tradicional
        // (no volem que es recarregue la pàgina)
        e.preventDefault();

        // Agafem referències a tots els camps del formulari
        const nombreApellidos = document.getElementById('nombreApellidos');
        const dniCifNia = document.getElementById('dniCifNia');
        const email = document.getElementById('email');
        const telefono = document.getElementById('telefono');
        const aceptar = document.getElementById('aceptar');

        // Netegem qualsevol missatge d'error anterior
        errorMensaje.textContent = '';

        // ====================================================
        // VALIDACIÓ CAMP A CAMP
        // ====================================================
        // Nota: cada if comprova una condició i si falla:
        //   1. Escriu el missatge d'error personalitzat
        //   2. Posa el focus al camp erroni
        //   3. Ix de la funció (return) sense continuar
        // Així veiem un sol error cada vegada, fins que es corregisca.

        // --- Nom i cognoms ---
        // Obligatori i entre 4 i 40 caràcters (ja té pattern ^[\w ]{4,40}$ a l'HTML)
        if (!nombreApellidos.value.trim()) {
            errorMensaje.textContent = 'El nombre y apellidos es obligatorio.';
            nombreApellidos.focus();
            return;
        }
        if (nombreApellidos.value.trim().length < 4 || nombreApellidos.value.trim().length > 40) {
            errorMensaje.textContent = 'El nombre y apellidos debe tener entre 4 y 40 caracteres.';
            nombreApellidos.focus();
            return;
        }

        // --- DNI / CIF / NIA ---
        // Obligatori, ha de complir un dels tres formats amb la regex
        // Regex: ^(\d{9}[A-Z])|([A-Z]\d{8})|(X\d{7}[A-Z])$
        //   Opció 1: 9 dígits seguits d'una lletra majúscula
        //   Opció 2: 1 lletra majúscula + 8 dígits
        //   Opció 3: X + 7 dígits + 1 lletra majúscula
        if (!dniCifNia.value.trim()) {
            errorMensaje.textContent = 'El campo DNI/CIF/NIA es obligatorio.';
            dniCifNia.focus();
            return;
        }
        const dniPattern = /^(\d{9}[A-Z])|([A-Z]\d{8})|(X\d{7}[A-Z])$/;
        if (!dniPattern.test(dniCifNia.value.trim())) {
            errorMensaje.textContent = 'El formato del DNI/CIF/NIA no es válido. Debe ser 9 dígitos+letra, letra+8 dígitos o X+7 dígitos+letra.';
            dniCifNia.focus();
            return;
        }

        // --- Email ---
        // Obligatori, comprova el format amb una regex (similar a la de l'HTML)
        if (!email.value.trim()) {
            errorMensaje.textContent = 'El email es obligatorio.';
            email.focus();
            return;
        }
        // Aquesta és la regex que utilitzem per a validar l'email de forma personalitzada.
        // Si el professor demana simplificar-la, es pot usar la validació integrada del
        // navegador (input type="email").
        const emailPattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (!emailPattern.test(email.value.trim())) {
            errorMensaje.textContent = 'El formato del email no es correcto.';
            email.focus();
            return;
        }

        // --- Telèfon ---
        // Obligatori, format (999) 666-333
        // Regex: ^\(\d{3}\)\s\d{3}-\d{3}$
        //   \( -> obri parèntesi
        //   \d{3} -> 3 dígits
        //   \) -> tanca parèntesi
        //   \s -> un espai en blanc
        //   \d{3} -> 3 dígits
        //   - -> guió
        //   \d{3} -> 3 dígits
        if (!telefono.value.trim()) {
            errorMensaje.textContent = 'El teléfono es obligatorio.';
            telefono.focus();
            return;
        }
        const telfPattern = /^\(\d{3}\)\s\d{3}-\d{3}$/;
        if (!telfPattern.test(telefono.value.trim())) {
            errorMensaje.textContent = 'El formato del teléfono debe ser (999) 666-333.';
            telefono.focus();
            return;
        }

        // --- Checkbox d'acceptació ---
        // Obligatori (ha d'estar marcat)
        if (!aceptar.checked) {
            errorMensaje.textContent = 'Debe aceptar las condiciones del sitio.';
            // Posem el focus al checkbox (encara que no es nota visualment)
            aceptar.focus();
            return;
        }

        // ====================================================
        // TOT CORRECTE: CONSTRUIR OBJECTE DE RESERVA I GUARDAR
        // ====================================================
        // Obtenim de nou l'objecte jugador del localStorage
        // (si per algun motiu ja no existira, usem un objecte buit)
        const jugador = JSON.parse(localStorage.getItem('jugadorSeleccionado') || '{}');

        // Creem l'objecte reserva amb l'estructura que demana l'enunciat
        const reserva = {
            jugador: jugador,   // l'objecte jugador complet
            cliente: {
                nombreApellidos: nombreApellidos.value.trim(),
                dniCifNia: dniCifNia.value.trim(),
                email: email.value.trim(),
                telefono: telefono.value.trim(),
                nota: document.getElementById('nota').value.trim()
            }
        };

        // Guardem la reserva al localStorage amb clau 'ultimaReserva'
        // (podríem fer una llista si volguérem mantindre un historial)
        localStorage.setItem('ultimaReserva', JSON.stringify(reserva));

        // Redirigim a la pàgina principal
        window.location.href = 'index.html';
    });
}