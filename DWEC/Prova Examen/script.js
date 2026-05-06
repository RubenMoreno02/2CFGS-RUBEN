//Variables blobales
var listaApunts = [];
var ordemAsc = true;



//Guardar apunte
function crearApunt(fecha, concepto, dh, importe){
    var apunt = {
        id: Date.now(),
        fecha: fecha,
        concepto: concepto,
        dh: dh,
        importe: parseFloat(importe)
    };
    return apunt;
}

//LocalStorage cargar
function cargarApuntes() {
    var datos = localStorage.getItem("apunts");
    if(datos !== null) {
        listaApunts = JSON.parse(datos);
    } else {
        listaApunts = [];
    }
}
// Guardar apunts
function guardarEnLocalStorage() {
    localStorage.setItem("apunts", JSON.stringify(listaApunts));
}


//Cargar datos
function cargarDatos(){
    var datosGuardados = localStorage.getItem("apunts");

    if (datosGuardados != null){
        listaApunts = JSON.parse(datosGuardados);
        mostrarTabla();
    } else{
        cargarDesdeJSON();
    }
}

//Cargar desde JSON
function cargarDesdeJSON(){
    fetch("datos.json").then(function(respuesta){
        return respuesta.json();
    })
    .then(function(datos) {
        listaApunts = datos;
        guardarEnLocalStorage();
        mostrarTabla();
    })
    .catch(function(error){
        console.log("No se puede cargar datos.json", error);
        listaApunts = [];
        mostrarTabla();
    });
}