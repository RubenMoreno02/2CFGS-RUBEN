<?php
include "Conexion.class.php";

$pdo = Conexion::conectar();

if (!isset($_GET["dni"])) {
    echo "No hi ha dni.";
    exit;
}

$dni = $_GET["dni"];

// Coger cliente para mostrarlo
$bus = $pdo->prepare("SELECT * FROM clientes WHERE dni=?");
$bus->execute([$dni]);
$cliente = $bus->fetch();

if (!$cliente) {
    echo "Cliente no encontrado.";
    exit;
}

$nombre = $cliente["nombre"];

if (isset($_POST["si"])) {
    $del = $pdo->prepare("DELETE FROM clientes WHERE dni=?");
    $del->execute([$dni]);

    header("Location: index.php?msg=borrat");
    exit;
}

if (isset($_POST["no"])) {
    header("Location: index.php");
    exit;
}

?>
<link rel="stylesheet" href="style.css">

<h1>Borrar cliente</h1>

<p class="borrarC">Quieres borrar el cliente <b><?php echo $nombre ?></b> con DNI <b><?php echo $dni ?></b>?</p>

<form method="POST">
    <input type="submit" name="si" value="Sí, borrar">
    <input type="submit" name="no" value="No, volver">
</form>
