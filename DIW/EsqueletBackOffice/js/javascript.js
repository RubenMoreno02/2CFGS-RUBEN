document.addEventListener("DOMContentLoaded", () => {
    // Elements del DOM
    const header = document.querySelector("header .LogoHeader");
    const menuVertical = document.querySelector(".menuVertical");
    
    // Variables d'estat
    let menuObert = false;

    // Crear botó hamburguesa
    const crearBotoHamburguesa = () => {
        const btnHamb = document.createElement("i");
        btnHamb.classList.add("fa-solid", "fa-bars", "btn-hamburguesa");
        header.prepend(btnHamb); // Inserta la hamburguesa a l'esquerra del logo
        
        return btnHamb;
    };

    // Gestionar el clic al botó hamburguesa
    const gestionarClicHamburguesa = (btnHamb) => {
        btnHamb.addEventListener("click", () => {
            menuObert = !menuObert;
            menuVertical.style.display = menuObert ? "block" : "none";
        });
    };

    // Comprovar l'amplada de la pantalla i ajustar el menú
    const comprovarAmpladaPantalla = (btnHamb) => {
        if (window.innerWidth > 777) {
            menuVertical.style.display = "block";
            btnHamb.style.display = "none";
        } else {
            menuVertical.style.display = "none";
            menuObert = false;
            btnHamb.style.display = "block";
        }
    };

    // Inicialització
    const inicialitzar = () => {
        const btnHamb = crearBotoHamburguesa();
        
        gestionarClicHamburguesa(btnHamb);
        
        // Configurar l'esdeveniment de redimensionament
        window.addEventListener("resize", () => comprovarAmpladaPantalla(btnHamb));
        
        // Comprovar l'estat inicial
        comprovarAmpladaPantalla(btnHamb);
    };

    // Executar la inicialització
    inicialitzar();
});