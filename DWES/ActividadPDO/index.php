<?php
require 'Conexion.class.php';
require 'Cliente.class.php';

$clientes = Cliente::getTodos();
?>

<link rel="stylesheet" href="style.css">

<h1>Llistat de clients</h1>
<a href="clientenuevo.php">Nuevo cliente</a>

<table border="1">
<tr><th>DNI</th><th>Nom</th><th>Correu</th><th>Accions</th></tr>

<?php foreach($clientes as $c): ?>
<tr>
    <td><?= $c->getDni() ?></td>
    <td><?= $c->getNombre() ?></td>
    <td><?= $c->getCorreo() ?></td>
    <td>
        <a href="editarcliente.php?dni=<?= $c->getDni() ?>">Editar</a>
        <a href="borrarcliente.php?dni=<?= $c->getDni() ?>">Borrar</a>
    </td>
</tr>
<?php endforeach; ?>

</table>
