<?php
session_start();

// Token CSRF para protección
if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

// Carpeta de imágenes
$uploadDir = 'uploads/';

// Crear carpeta si no existe
if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

// Manejar subida de archivos
$mensaje = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['imagen'])) {
    if ($_POST['csrf_token'] !== $_SESSION['csrf_token']) {
        $mensaje = 'Error de seguridad. Inténtalo de nuevo.';
    } else {
        $archivo = $_FILES['imagen'];
        $nombreArchivo = basename($archivo['name']);
        $rutaCompleta = $uploadDir . $nombreArchivo;
        
        // Validar tipo de archivo
        $extension = strtolower(pathinfo($nombreArchivo, PATHINFO_EXTENSION));
        $extensionesPermitidas = ['jpg', 'jpeg', 'png', 'gif'];
        
        $tipoMime = mime_content_type($archivo['tmp_name']);
        $tiposMimePermitidos = ['image/jpeg', 'image/png', 'image/gif'];
        
        if (!in_array($extension, $extensionesPermitidas)) {
            $mensaje = 'Solo se permiten imágenes JPG, PNG o GIF.';
        } elseif (!in_array($tipoMime, $tiposMimePermitidos)) {
            $mensaje = 'Tipo de archivo no permitido.';
        } elseif ($archivo['size'] > 5 * 1024 * 1024) { // 5MB máximo
            $mensaje = 'El archivo es demasiado grande (máximo 5MB).';
        } elseif ($archivo['error'] !== UPLOAD_ERR_OK) {
            $mensaje = 'Error al subir el archivo.';
        } elseif (move_uploaded_file($archivo['tmp_name'], $rutaCompleta)) {
            $mensaje = 'Imagen subida correctamente.';
        } else {
            $mensaje = 'Error al guardar la imagen.';
        }
    }
}

// Obtener lista de imágenes ordenadas por fecha
$imagenes = [];
if (file_exists($uploadDir)) {
    $archivos = scandir($uploadDir);
    foreach ($archivos as $archivo) {
        if ($archivo !== '.' && $archivo !== '..') {
            $ruta = $uploadDir . $archivo;
            if (in_array(strtolower(pathinfo($archivo, PATHINFO_EXTENSION)), ['jpg', 'jpeg', 'png', 'gif'])) {
                $imagenes[] = [
                    'nombre' => $archivo,
                    'ruta' => $ruta,
                    'fecha' => filemtime($ruta)
                ];
            }
        }
    }
    
    // Ordenar por fecha (más reciente primero)
    usort($imagenes, function($a, $b) {
        return $b['fecha'] - $a['fecha'];
    });
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galería de Imágenes</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <div class="container">
        <h1>Galería de Imágenes</h1>
        
        <?php if ($mensaje): ?>
            <div class="mensaje"><?php echo htmlspecialchars($mensaje); ?></div>
        <?php endif; ?>
        
        <div class="formulario-subida">
            <h2>Subir nueva imagen</h2>
            <form method="post" enctype="multipart/form-data">
                <input type="hidden" name="csrf_token" value="<?php echo $_SESSION['csrf_token']; ?>">
                <input type="file" name="imagen" accept="image/jpeg,image/png,image/gif" required>
                <button type="submit">Subir Imagen</button>
            </form>
        </div>
        
        <div class="galeria">
            <h2>Imágenes subidas</h2>
            <?php if (empty($imagenes)): ?>
                <p>No hay imágenes subidas todavía.</p>
            <?php else: ?>
                <div class="grid-imagenes">
                    <?php foreach ($imagenes as $imagen): ?>
                        <div class="imagen-item">
                            <img src="<?php echo $imagen['ruta']; ?>" alt="<?php echo htmlspecialchars($imagen['nombre']); ?>">
                            <div class="info-imagen">
                                <span class="nombre"><?php echo htmlspecialchars($imagen['nombre']); ?></span>
                                <span class="fecha"><?php echo date('d/m/Y H:i', $imagen['fecha']); ?></span>
                                <form method="post" action="borrar.php" class="form-borrar">
                                    <input type="hidden" name="csrf_token" value="<?php echo $_SESSION['csrf_token']; ?>">
                                    <input type="hidden" name="imagen" value="<?php echo htmlspecialchars($imagen['nombre']); ?>">
                                    <button type="submit" onclick="return confirm('¿Estás seguro de que quieres borrar esta imagen?')">Borrar</button>
                                </form>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>
        </div>
    </div>
</body>
</html>