document.addEventListener("DOMContentLoaded", () => {

    // Crear botó hamburguesa
    const header = document.querySelector("header .LogoHeader");
    const menuVertical = document.querySelector(".menuVertical");

    // Crear icona hamburguesa
    const btnHamb = document.createElement("i");
    btnHamb.classList.add("fa-solid", "fa-bars", "btn-hamburguesa");
    header.prepend(btnHamb); // Inserta la hamburguesa a l'esquerra del logo

    // Estat del menú
    let menuObert = false;

    // Event click hamburguesa
    btnHamb.addEventListener("click", () => {
        menuObert = !menuObert;

        if (menuObert) {
            menuVertical.style.display = "block";
        } else {
            menuVertical.style.display = "none";
        }
    });

    // Quan la pantalla és més gran que 777px → menú sempre visible
    const checkWidth = () => {
        if (window.innerWidth > 777) {
            menuVertical.style.display = "block";
            btnHamb.style.display = "none";
        } else {
            menuVertical.style.display = "none";
            menuObert = false;
            btnHamb.style.display = "block";
            
        }
    };

    window.addEventListener("resize", checkWidth);
    checkWidth();
});
