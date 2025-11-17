<?php
session_start();

// Verificar token CSRF
if ($_SERVER['REQUEST_METHOD'] !== 'POST' || 
    empty($_POST['csrf_token']) || 
    $_POST['csrf_token'] !== $_SESSION['csrf_token']) {
    header('HTTP/1.1 403 Forbidden');
    die('Acceso denegado.');
}

// Carpeta de imágenes
$uploadDir = 'uploads/';

// Obtener nombre de archivo seguro
$nombreImagen = basename($_POST['imagen'] ?? '');
$rutaCompleta = $uploadDir . $nombreImagen;

// Verificar que el archivo existe y es una imagen
if (file_exists($rutaCompleta) && 
    in_array(strtolower(pathinfo($nombreImagen, PATHINFO_EXTENSION)), ['jpg', 'jpeg', 'png', 'gif'])) {
    
    // Eliminar archivo
    if (unlink($rutaCompleta)) {
        $_SESSION['mensaje'] = 'Imagen borrada correctamente.';
    } else {
        $_SESSION['mensaje'] = 'Error al borrar la imagen.';
    }
} else {
    $_SESSION['mensaje'] = 'Imagen no encontrada o no válida.';
}

// Redirigir de vuelta a la galería
header('Location: index.php');
exit;