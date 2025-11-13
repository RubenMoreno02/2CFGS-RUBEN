<?php
// Carga todas las visitas desde el archivo
function cargarVisitas() {
    if (!file_exists("visitas.txt")) {
        return [];
    }
    $lineas = file("visitas.txt", FILE_IGNORE_NEW_LINES);
    return $lineas;
}

// Guarda una nueva visita
function guardarVisita($comentario) {
    $comentario = trim($comentario);
    if ($comentario !== "") {
        file_put_contents("visitas.txt", $comentario . PHP_EOL, FILE_APPEND);
    }
}

// Pinta un comentario individual
function pintarVisita($texto) {
    echo "<p style='border-bottom:1px solid #ccc; padding:8px;'>$texto</p>";
}
?>
