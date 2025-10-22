<?php
require_once 'funciones.php';

$errores = [];
$cliente = null;

// Obtener DNI del cliente a editar
$dni = $_GET['dni'] ?? '';

if (empty($dni)) {
    header('Location:index.php');
    exit;
}

$pdo = conectarBD();
try {
    $stmt = $pdo->prepare('SELECT * FROM clientes WHERE dni = :dni');
    $stmt->execute([':dni' => $dni]);
    $stmt->setFetchMode(PDO::FETCH_CLASS, 'Cliente');
    $cliente = $stmt->fetch();
    
    if (!$cliente) {
        header('Location: index.php?mensaje=Cliente no encontrado');
        exit;
    }
} catch (PDOException $e) {
    die('Error al cargar el cliente: ' . $e->getMessage());
} finally {
    desconectarBD($pdo);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $datos = [
        'dni' => $dni, // El DNI no se modifica
        'nombre' => trim($_POST['nombre'] ?? ''),
        'apellidos' => trim($_POST['apellidos'] ?? ''),
        'direccion' => trim($_POST['direccion'] ?? ''),
        'localidad' => trim($_POST['localidad'] ?? ''),
        'email' => trim($_POST['email'] ?? ''),
        'telefono' => trim($_POST['telefono'] ?? ''),
        'fecha_nac' => trim($_POST['fecha_nac'] ?? '')
    ];

    // Validaciones
    if (empty($datos['nombre'])) {
        $errores['nombre'] = 'El nombre es obligatorio';
    }

    if (empty($datos['email']) || !filter_var($datos['email'], FILTER_VALIDATE_EMAIL)) {
        $errores['email'] = 'Email no válido';
    }

    if (empty($errores)) {
        $pdo = conectarBD();
        try {
            $stmt = $pdo->prepare(
                'UPDATE clientes SET nombre = :nombre, apellidos = :apellidos, direccion = :direccion, 
                 localidad = :localidad, email = :email, telefono = :telefono, fecha_nac = :fecha_nac 
                 WHERE dni = :dni'
            );
            
            $resultado = $stmt->execute([
                ':nombre' => $datos['nombre'],
                ':apellidos' => $datos['apellidos'],
                ':direccion' => $datos['direccion'],
                ':localidad' => $datos['localidad'],
                ':email' => $datos['email'],
                ':telefono' => $datos['telefono'],
                ':fecha_nac' => $datos['fecha_nac'] ?: null,
                ':dni' => $datos['dni']
            ]);

            if ($resultado && $stmt->rowCount() > 0) {
                header('Location: index.php?mensaje=Cliente actualizado correctamente');
                exit;
            } else {
                $errores['general'] = 'No se realizaron cambios en el cliente';
            }
        } catch (PDOException $e) {
            $errores['general'] = 'Error al actualizar el cliente: ' . $e->getMessage();
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
    <title>Editar Cliente</title>
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
        .campo-deshabilitado { background-color: #e9ecef; opacity: 1; }
    </style>
</head>
<body>
    <h1>Editar Cliente</h1>

    <?php if (isset($errores['general'])): ?>
        <div style="color: #dc3545; padding: 10px; margin-bottom: 15px; border: 1px solid #dc3545; border-radius: 4px;">
            <?php echo $errores['general']; ?>
        </div>
    <?php endif; ?>

    <form method="POST">
        <div class="form-group">
            <label for="dni">DNI</label>
            <input type="text" id="dni" name="dni" value="<?php echo htmlspecialchars($cliente->getDni()); ?>" 
                   class="campo-deshabilitado" disabled>
            <small>El DNI no se puede modificar (clave primaria)</small>
        </div>

        <div class="form-group">
            <label for="nombre">Nombre *</label>
            <input type="text" id="nombre" name="nombre" 
                   value="<?php echo htmlspecialchars($_POST['nombre'] ?? $cliente->getNombre()); ?>"
                   <?php echo isset($errores['nombre']) ? 'class="campo-error"' : ''; ?>>
            <?php if (isset($errores['nombre'])): ?>
                <div class="error"><?php echo $errores['nombre']; ?></div>
            <?php endif; ?>
        </div>

        <div class="form-group">
            <label for="apellidos">Apellidos</label>
            <input type="text" id="apellidos" name="apellidos" 
                   value="<?php echo htmlspecialchars($_POST['apellidos'] ?? $cliente->getApellidos()); ?>">
        </div>

        <div class="form-group">
            <label for="direccion">Dirección</label>
            <textarea id="direccion" name="direccion"><?php echo htmlspecialchars($_POST['direccion'] ?? $cliente->getDireccion()); ?></textarea>
        </div>

        <div class="form-group">
            <label for="localidad">Localidad</label>
            <input type="text" id="localidad" name="localidad" 
                   value="<?php echo htmlspecialchars($_POST['localidad'] ?? $cliente->getLocalidad()); ?>">
        </div>

        <div class="form-group">
            <label for="email">Email *</label>
            <input type="email" id="email" name="email" 
                   value="<?php echo htmlspecialchars($_POST['email'] ?? $cliente->getEmail()); ?>"
                   <?php echo isset($errores['email']) ? 'class="campo-error"' : ''; ?>>
            <?php if (isset($errores['email'])): ?>
                <div class="error"><?php echo $errores['email']; ?></div>
            <?php endif; ?>
        </div>

        <div class="form-group">
            <label for="telefono">Teléfono</label>
            <input type="tel" id="telefono" name="telefono" 
                   value="<?php echo htmlspecialchars($_POST['telefono'] ?? $cliente->getTelefono()); ?>">
        </div>

        <div class="form-group">
            <label for="fecha_nac">Fecha de Nacimiento</label>
            <input type="date" id="fecha_nac" name="fecha_nac" 
                   value="<?php echo htmlspecialchars($_POST['fecha_nac'] ?? $cliente->getFechaNac()); ?>">
        </div>

        <div class="form-group">
            <button type="submit" class="btn btn-primary">Actualizar Cliente</button>
            <a href="index.php" class="btn btn-secondary">Cancelar</a>
        </div>
    </form>
</body>
</html>