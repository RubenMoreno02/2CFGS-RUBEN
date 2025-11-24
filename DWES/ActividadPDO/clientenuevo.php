<?php
require 'Conexion.class.php';

$errores = [];
$nombre = "";
$correo = "";
$dni = "";

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $dni = $_POST['dni'];
    $nombre = $_POST['nombre'];
    $correo = $_POST['correo'];

    if (empty($nombre)) $errores[] = "El nombre es obligatorio";
    if (empty($correo)) $errores[] = "El correo es obligatorio";
    if (!preg_match("/^[0-9]{8}[A-Za-z]$/", $dni)) $errores[] = "DNI incorrecto";

    if (empty($errores)) {
        try {
            $pdo = Conexion::conectar();
            $stmt = $pdo->prepare("INSERT INTO clientes (dni, nombre, correo) VALUES (?, ?, ?)");
            $stmt->execute([$dni, $nombre, $correo]);
            header("Location: index.php");
        } catch (PDOException $e) {
            $errores[] = "Este DNI ya existe";
        }
    }
}
?>
<h1>Nuevo Cliente</h1>
<form method="POST">
    <link rel="stylesheet" href="style.css">
    
    DNI: <input type="text" name="dni" value="<?= $dni ?>"><br>
    Nombre: <input type="text" name="nombre" value="<?= $nombre ?>"><br>
    Correo: <input type="email" name="correo" value="<?= $correo ?>"><br>
    <button type="submit">Guardar</button>
</form>

<?php foreach($errores as $e) echo "<p style='color:red'>$e</p>"; ?>