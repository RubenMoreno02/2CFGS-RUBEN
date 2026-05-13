document.addEventListener('DOMContentLoaded', () => {
    fetch('js/bbdd.json')
        .then(response => response.json())
        .then(jsonData => {
            data = jsonData;
            main();
        })
        .catch(error => console.error('Error JSON', error));
})


function main() {
    let cochesActuales = [...data.cars];

    function limpiarNodos(elemento){
        while(elemento.firstChild){
            elemento.removeChild(elemento.firstChield);
        }
    }

    function crearTarjeta(coche, index){
        const precioFormateado = parseInt(coche.precio).toLocaleString('es-ES');
        const kmFormateado = parseInt(coche.km).toLocaleString('es-ES');
        
        //card
        const card = document.createElement('div');
        card.classList.add('card', 'mb-4');

        //imagen
        const enlaceImg = document.createElement('a');
        enlaceImg.href = '#!';
        const img = document.createElement('img');
        img.classList.add('card-img-top');
        img.src = `img/${coche.img}`;
        img.alt = `${coche.marca} ${coche.modelo}`;
        enlaceImg.appendChild(img);

        //card body
        const cardBody = document.createElement('div');
        cardBody.classList.add('card-body');

        //titulo
        const titulo = document.createElement('h2');
        titulo.classList.add('card-title');
        titulo.appendChild(document.createTextNode(`${coche.marca} ${coche.modelo}`));

        //precio
        const rowPrecio = document.createElement('div');
        rowPrecio.classList.add('row', 'justify-content-end');
        const divPrecio = document.createElement('div');
        divPrecio.classList.add('p-2', 'mb-1', 'col-md-3', 'offset-md-3', 'bg-warning', 'rounded', 'text-center')
        const h2Precio = document.createElement('h2');
        h2Precio.classList.add('font-weight-bold');
        h2Precio.appendChild(document.createTextNode(`${precioFormateado} €`));
        divPrecio.appendChild(h2Precio);
        rowPrecio.appendChild(divPrecio);

        //fila cabecera
        const rowDatos = document.createElement('div');
        rowDatos.classList.add('row');

        const cabeceras = ['Año', 'Kilometros', 'Cambio', 'Combustible'];
        cabeceras.forEach(texto => {
            const col = document.createElement('div');
            col.classList.add('col', 'p-3', 'text-center', 'border-bottom', 'border-dark');
            col.appendChild(document.createTextNode(texto));
            rowDatos.appendChild(col);
        });

        //separador w-100
        const separador = document.createElement('div');
        separador.classList.add('w-100');
        rowDatos.appendChild(separador);

        //fila valores
        const valores = [coche.anyo, `${kmFormateado} Km.`, coche.cambio, coche.combustible];
        valores.forEach(valor => {
            const col = document.createElement('div');
            col.classList.add('col', 'p-3', 'text-center');
            const strong = document.createElement('strong');
            strong.appendChild(document.createTextNode(valor));
            col.appendChild(strong);
            rowDatos.appendChild(col);
        })

        //boton reservar
        const btnReservar = document.createElement('a');
        btnReservar.classList.add('btn', 'btn-text-primary', 'm-3');
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


    function renderizarCoches(lista){
        const listado = document.getElementById('listado');
        while (listado.firstChild){
            listado.removeChild(listado.firstChild);
        }

        lista.forEach((coche, index) =>{
            const tarjeta = crearTarjeta(coche, index);
            listado.appendChild(tarjeta);
        });
    }
    renderizarCoches(cochesActuales);
















}