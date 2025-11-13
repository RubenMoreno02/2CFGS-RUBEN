<?php
require_once("funciones.php");

// Recoger comentario del formulario
if (isset($_POST['comentario'])) {
    $comentario = htmlspecialchars($_POST['comentario']);
    guardarVisita($comentario);
}

// Redireccionar sin mostrar nada
header("Location: libro_visitas.php");
exit;
?>
