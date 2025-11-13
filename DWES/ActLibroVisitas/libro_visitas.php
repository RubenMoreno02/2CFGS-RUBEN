<?php
require_once("funciones.php");
$visitas = cargarVisitas();
?>
<!DOCTYPE html>
<html>
<head>
    <title>Libro de visitas</title>
</head>
<body>
    <h1>Libro de visitas</h1>

    <?php
    if (count($visitas) === 0) {
        echo "<p>No hay comentarios todavía.</p>";
    } else {
        foreach ($visitas as $v) {
            pintarVisita($v);
        }
    }
    ?>

    <p><a href="nueva_visita.php">Añadir un comentario</a></p>
    <p><a href="index.php">Volver al inicio</a></p>
</body>
</html>
