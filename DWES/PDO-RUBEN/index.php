<?php
require_once 'funciones.php';

$clientes = obtenerClientes();
$mensaje = isset($_GET['mensaje']) ? $_GET['mensaje'] : '';
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mantenimiento de Clientes</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #333; }
        .mensaje { padding: 10px; margin: 10px 0; border-radius: 5px; }
        .exito { background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .error { background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background-color: #f2f2f2; }
        .acciones a { margin-right: 10px; text-decoration: none; }
        .editar { color: #007bff; }
        .borrar { color: #dc3545; }
        .btn-nuevo { background-color: #28a745; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; }
        .btn-nuevo:hover { background-color: #218838; }
    </style>
</head>
<body>
    <h1>MANTENIMIENTO DE CLIENTES</h1>
    <p><strong>con PDO y usando POO</strong></p>

    <?php if ($mensaje): ?>
        <div class="mensaje exito"><?php echo htmlspecialchars($mensaje); ?></div>
    <?php endif; ?>

    <a href="clientenuevo.php" class="btn-nuevo">Nuevo Cliente</a>

    <table>
        <thead>
            <tr>
                <th>DNI</th>
                <th>Nombre</th>
                <th>Apellidos</th>
                <th>Dirección</th>
                <th>Localidad</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Fecha Nac.</th>
                <th>Acciones</th>
            </tr>
        </thead>
        <tbody>
            <?php if (empty($clientes)): ?>
                <tr>
                    <td colspan="9" style="text-align: center;">No hay clientes registrados</td>
                </tr>
            <?php else: ?>
                <?php foreach ($clientes as $cliente): ?>
                <tr>
                    <td><?php echo htmlspecialchars($cliente->getDni()); ?></td>
                    <td><?php echo htmlspecialchars($cliente->getNombre()); ?></td>
                    <td><?php echo htmlspecialchars($cliente->getApellidos()); ?></td>
                    <td><?php echo htmlspecialchars($cliente->getDireccion()); ?></td>
                    <td><?php echo htmlspecialchars($cliente->getLocalidad()); ?></td>
                    <td><?php echo htmlspecialchars($cliente->getEmail()); ?></td>
                    <td><?php echo htmlspecialchars($cliente->getTelefono()); ?></td>
                    <td><?php echo htmlspecialchars($cliente->getFechaNac()); ?></td>
                    <td class="acciones">
                        <a href="editarcliente.php?dni=<?php echo $cliente->getDni(); ?>" class="editar">✏️ Editar</a>
                        <a href="borrarcliente.php?dni=<?php echo $cliente->getDni(); ?>" class="borrar">🗑️ Borrar</a>
                    </td>
                </tr>
                <?php endforeach; ?>
            <?php endif; ?>
        </tbody>
    </table>    
</body>
</html>