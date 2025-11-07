// Aquesta constant simbolitza la velocitat.
// Realment és el número de píxels que ens movem
// en la pantalla quan prémem una de les tecles de
// moviment
const pixels_a_moure = 35;

// Variables per controlar l'estat del so
let soActivat = true;
let movimentActiu = false;
// Variable per controlar la direcció actual (1 = dreta, -1 = esquerra)
let direccioActual = 1;

function moureEsquerra() {
  let element = document.getElementById("avio");
  let pos = getAvioPos();
  let novaPos = pos.left - pixels_a_moure;
  
  // Verificar límits de la pantalla
  if (novaPos >= 0) {
    element.style.left = novaPos + "px";
    // Canviar a la imatge de moviment cap a l'esquerra
    element.style.backgroundImage = "url('imatges-avions/esquerra-turbo.png')";
    // Actualitzar direcció
    direccioActual = -1;
    // Reproduir so de moviment
    reproducirSoMoviment();
  }
}

function moureDreta() {
  let element = document.getElementById("avio");
  let pos = getAvioPos();
  let gameArea = document.querySelector(".game-area");
  let maxWidth = gameArea.offsetWidth - element.offsetWidth;
  let novaPos = pos.left + pixels_a_moure;
  
  // Verificar límits de la pantalla
  if (novaPos <= maxWidth) {
    element.style.left = novaPos + "px";
    // Canviar a la imatge de moviment cap a la dreta
    element.style.backgroundImage = "url('imatges-avions/dreta-turbo.png')";
    // Actualitzar direcció
    direccioActual = 1;
    // Reproduir so de moviment
    reproducirSoMoviment();
  }
}

function moureAmunt() {
  let element = document.getElementById("avio");
  let pos = getAvioPos();
  let novaPos = pos.top - pixels_a_moure;
  
  // Verificar límits de la pantalla
  if (novaPos >= 0) {
    element.style.top = novaPos + "px";
    // Utilitzar la imatge de moviment segons la direcció actual
    if (direccioActual === 1) {
      element.style.backgroundImage = "url('imatges-avions/dreta-turbo.png')";
    } else {
      element.style.backgroundImage = "url('imatges-avions/esquerra-turbo.png')";
    }
    // Reproduir so de moviment
    reproducirSoMoviment();
  }
}

function moureAvall() {
  let element = document.getElementById("avio");
  let pos = getAvioPos();
  let gameArea = document.querySelector(".game-area");
  let maxHeight = gameArea.offsetHeight - element.offsetHeight;
  let novaPos = pos.top + pixels_a_moure;
  
  // Verificar límits de la pantalla
  if (novaPos <= maxHeight) {
    element.style.top = novaPos + "px";
    // Utilitzar la imatge de moviment segons la direcció actual
    if (direccioActual === 1) {
      element.style.backgroundImage = "url('imatges-avions/dreta-turbo.png')";
    } else {
      element.style.backgroundImage = "url('imatges-avions/esquerra-turbo.png')";
    }
    // Reproduir so de moviment
    reproducirSoMoviment();
  }
}

function passarANumero(n) {
  return parseInt(n == "auto" ? 0 : n);
}

/**
 * Aquesta funció en torna una objecte amb la posició actual de l'avió a la pantalla
 * return obj.left --> posició de l'avió de l'eix X
 *        obj.top --> posició de l'avió de l'eix Y
 */
function getAvioPos() {
  let avio = document.getElementById("avio");
  let obj = {
    left: passarANumero(getComputedStyle(avio).left),
    top: passarANumero(getComputedStyle(avio).top),
  };
  return obj;
}

/**
 * Funció per reproduir el so de moviment
 */
function reproducirSoMoviment() {
  if (soActivat && !movimentActiu) {
    let movementSound = document.getElementById("movementSound");
    movementSound.currentTime = 0;
    movementSound.play();
    movimentActiu = true;
  }
}

/**
 * Funció per aturar el so de moviment
 */
function aturarSoMoviment() {
  let movementSound = document.getElementById("movementSound");
  movementSound.pause();
  movementSound.currentTime = 0;
  movimentActiu = false;
}

/**
 * Funció per activar/desactivar el so
 */
function toggleSo() {
  let backgroundMusic = document.getElementById("backgroundMusic");
  soActivat = !soActivat;
  
  if (soActivat) {
    backgroundMusic.play();
  } else {
    backgroundMusic.pause();
    aturarSoMoviment();
  }
}

/**
 * Funció per tornar a la imatge de quiet segons la direcció
 */
function tornarAQuiet() {
  let element = document.getElementById("avio");
  if (direccioActual === 1) {
    element.style.backgroundImage = "url('imatges-avions/dreta.png')";
  } else {
    element.style.backgroundImage = "url('imatges-avions/esquerra.png')";
  }
}

/**
 * Funció encarregada de controlar quina tecla s'ha "apretat"
 * @param {*} evt: event que es llança
 */
function moureAvio(evt) {
  switch (evt.keyCode) {
    case 37:
      /** hem apretat la tecla de fletxa esquerra */
      moureEsquerra();
      break;
    case 39:
      /** hem apretat la tecla de fletxa dreta */
      moureDreta();
      break;
    case 38:
      /** hem apretat la tecla de fletxa amunt */
      moureAmunt();
      break;
    case 40:
      /** hem apretat la tecla de fletxa avall */
      moureAvall();
      break;
    case 49: // Tecla "1"
      /** activar/desactivar so */
      toggleSo();
      break;
  }
}

/**
 * Funció encarregada de fer el que calga quan es pare l'avió
 */
function pararAvio() {
  // Tornar a la imatge de l'avió quiet
  tornarAQuiet();
  // Aturar el so de moviment
  aturarSoMoviment();
}

function docReady() {
  // Iniciar la música de fons
  let backgroundMusic = document.getElementById("backgroundMusic");
  backgroundMusic.volume = 0.5; // Afegir volum per seguretat
  backgroundMusic.play().catch(e => console.log("Error reproduint música:", e));
  
  // Configurar la imatge inicial (dreta quiet)
  let element = document.getElementById("avio");
  element.style.backgroundImage = "url('imatges-avions/dreta.png')";
  
  // Afegir event listeners
  window.addEventListener("keydown", moureAvio);
  window.addEventListener("keyup", pararAvio);
}

// Executar quan el document estigui carregat
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", docReady);
} else {
  docReady();
}