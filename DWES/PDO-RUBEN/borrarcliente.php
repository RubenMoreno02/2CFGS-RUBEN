<?php
require_once 'funciones.php';

$dni = $_GET['dni'] ?? '';
$confirmado = $_POST['confirmado'] ?? false;
$cliente = null;

if (empty($dni)) {
    header('Location: index.php');
    exit;
}

// Cargar datos del cliente
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

// Procesar confirmación de borrado
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $confirmado) {
    $pdo = conectarBD();
    try {
        $stmt = $pdo->prepare('DELETE FROM clientes WHERE dni = :dni');
        $stmt->execute([':dni' => $dni]);
        
        if ($stmt->rowCount() > 0) {
            $mensaje = "Cliente " . htmlspecialchars($cliente->getNombreCompleto()) . " eliminado correctamente";
            header('Location: index.php?mensaje=' . urlencode($mensaje));
            exit;
        } else {
            $error = "No se pudo eliminar el cliente";
        }
    } catch (PDOException $e) {
        $error = "Error al eliminar el cliente: " . $e->getMessage();
    } finally {
        desconectarBD($pdo);
    }
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Borrar Cliente</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .confirmacion { background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .info-cliente { background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .btn { padding: 10px 15px; border: none; border-radius: 4px; cursor: pointer; text-decoration: none; display: inline-block; }
        .btn-danger { background-color: #dc3545; color: white; }
        .btn-secondary { background-color: #6c757d; color: white; }
        .error { color: #dc3545; padding: 10px; margin: 10px 0; border: 1px solid #dc3545; border-radius: 4px; }
    </style>
</head>
<body>
    <h1>Borrar Cliente</h1>

    <?php if (isset($error)): ?>
        <div class="error"><?php echo $error; ?></div>
    <?php endif; ?>

    <div class="confirmacion">
        <h2>¿Está seguro de que desea eliminar este cliente?</h2>
        <p>Esta acción no se puede deshacer.</p>
    </div>

    <div class="info-cliente">
        <h3>Información del cliente:</h3>
        <p><strong>DNI:</strong> <?php echo htmlspecialchars($cliente->getDni()); ?></p>
        <p><strong>Nombre:</strong> <?php echo htmlspecialchars($cliente->getNombreCompleto()); ?></p>
        <p><strong>Email:</strong> <?php echo htmlspecialchars($cliente->getEmail()); ?></p>
        <p><strong>Teléfono:</strong> <?php echo htmlspecialchars($cliente->getTelefono()); ?></p>
        <p><strong>Localidad:</strong> <?php echo htmlspecialchars($cliente->getLocalidad()); ?></p>
    </div>

    <form method="POST">
        <input type="hidden" name="confirmado" value="1">
        <button type="submit" class="btn btn-danger" onclick="return confirm('¿Está completamente seguro?')">Sí, eliminar cliente</button>
        <a href="index.php" class="btn btn-secondary">Cancelar</a>
    </form>
</body>
</html>