<?php
require_once 'funciones.php';

$errores = [];
$datos = [
    'dni' => '', 'nombre' => '', 'apellidos' => '', 'direccion' => '',
    'localidad' => '', 'email' => '', 'telefono' => '', 'fecha_nac' => ''
];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Recoger y sanitizar datos
    $datos = [
        'dni' => trim($_POST['dni'] ?? ''),
        'nombre' => trim($_POST['nombre'] ?? ''),
        'apellidos' => trim($_POST['apellidos'] ?? ''),
        'direccion' => trim($_POST['direccion'] ?? ''),
        'localidad' => trim($_POST['localidad'] ?? ''),
        'email' => trim($_POST['email'] ?? ''),
        'telefono' => trim($_POST['telefono'] ?? ''),
        'fecha_nac' => trim($_POST['fecha_nac'] ?? '')
    ];

    // Validaciones
    if (empty($datos['dni'])) {
        $errores['dni'] = 'El DNI es obligatorio';
    } elseif (!validarDNI($datos['dni'])) {
        $errores['dni'] = 'DNI no válido. Formato: 8 números + 1 letra (Ej: 12345678Z)';
    }

    if (empty($datos['nombre'])) {
        $errores['nombre'] = 'El nombre es obligatorio';
    }

    if (empty($datos['email']) || !filter_var($datos['email'], FILTER_VALIDATE_EMAIL)) {
        $errores['email'] = 'Email no válido';
    }

    // Si no hay errores, intentar insertar
    if (empty($errores)) {
        $pdo = conectarBD();
        try {
            // Verificar si el DNI ya existe
            if (dniExiste($datos['dni'], $pdo)) {
                $errores['dni'] = 'El DNI ya existe en la base de datos';
            } else {
                $stmt = $pdo->prepare(
                    'INSERT INTO clientes (dni, nombre, apellidos, direccion, localidad, email, telefono, fecha_nac) 
                     VALUES (:dni, :nombre, :apellidos, :direccion, :localidad, :email, :telefono, :fecha_nac)'
                );
                
                $resultado = $stmt->execute([
                    ':dni' => $datos['dni'],
                    ':nombre' => $datos['nombre'],
                    ':apellidos' => $datos['apellidos'],
                    ':direccion' => $datos['direccion'],
                    ':localidad' => $datos['localidad'],
                    ':email' => $datos['email'],
                    ':telefono' => $datos['telefono'],
                    ':fecha_nac' => $datos['fecha_nac'] ?: null
                ]);

                if ($resultado) {
                    header('Location: index.php?mensaje=Cliente creado correctamente');
                    exit;
                }
            }
        } catch (PDOException $e) {
            $errores['general'] = 'Error al crear el cliente: ' . $e->getMessage();
        } finally {
            desconectarBD($pdo);
        }
    }
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nuevo Cliente</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .form-group { margin-bottom: 15px; }
        label { display: block; margin-bottom: 5px; font-weight: bold; }
        input, textarea { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
        .error { color: #dc3545; font-size: 0.9em; margin-top: 5px; }
        .btn { padding: 10px 15px; border: none; border-radius: 4px; cursor: pointer; text-decoration: none; display: inline-block; }
        .btn-primary { background-color: #007bff; color: white; }
        .btn-secondary { background-color: #6c757d; color: white; }
        .campo-error { border-color: #dc3545; }
    </style>
</head>
<body>
    <h1>Nuevo Cliente</h1>

    <?php if (isset($errores['general'])): ?>
        <div style="color: #dc3545; padding: 10px; margin-bottom: 15px; border: 1px solid #dc3545; border-radius: 4px;">
            <?php echo $errores['general']; ?>
        </div>
    <?php endif; ?>

    <form method="POST">
        <div class="form-group">
            <label for="dni">DNI *</label>
            <input type="text" id="dni" name="dni" value="<?php echo htmlspecialchars($datos['dni']); ?>" 
                maxlength="9" placeholder="12345678X" 
                <?php echo isset($errores['dni']) ? 'class="campo-error"' : ''; ?>>
            <?php if (isset($errores['dni'])): ?>
                <div class="error"><?php echo $errores['dni']; ?></div>
            <?php endif; ?>
        </div>

        <div class="form-group">
            <label for="nombre">Nombre *</label>
            <input type="text" id="nombre" name="nombre" value="<?php echo htmlspecialchars($datos['nombre']); ?>"
                   <?php echo isset($errores['nombre']) ? 'class="campo-error"' : ''; ?>>
            <?php if (isset($errores['nombre'])): ?>
                <div class="error"><?php echo $errores['nombre']; ?></div>
            <?php endif; ?>
        </div>

        <div class="form-group">
            <label for="apellidos">Apellidos</label>
            <input type="text" id="apellidos" name="apellidos" value="<?php echo htmlspecialchars($datos['apellidos']); ?>">
        </div>

        <div class="form-group">
            <label for="direccion">Dirección</label>
            <textarea id="direccion" name="direccion"><?php echo htmlspecialchars($datos['direccion']); ?></textarea>
        </div>

        <div class="form-group">
            <label for="localidad">Localidad</label>
            <input type="text" id="localidad" name="localidad" value="<?php echo htmlspecialchars($datos['localidad']); ?>">
        </div>

        <div class="form-group">
            <label for="email">Email *</label>
            <input type="email" id="email" name="email" value="<?php echo htmlspecialchars($datos['email']); ?>"
                   <?php echo isset($errores['email']) ? 'class="campo-error"' : ''; ?>>
            <?php if (isset($errores['email'])): ?>
                <div class="error"><?php echo $errores['email']; ?></div>
            <?php endif; ?>
        </div>

        <div class="form-group">
            <label for="telefono">Teléfono</label>
            <input type="tel" id="telefono" name="telefono" value="<?php echo htmlspecialchars($datos['telefono']); ?>">
        </div>

        <div class="form-group">
            <label for="fecha_nac">Fecha de Nacimiento</label>
            <input type="date" id="fecha_nac" name="fecha_nac" value="<?php echo htmlspecialchars($datos['fecha_nac']); ?>">
        </div>

        <div class="form-group">
             <button type="submit" class="btn btn-primary">Crear Cliente</button>
            <a href="index.php" class="btn btn-secondary">Cancelar</a>

    </form>
</body>
</html>