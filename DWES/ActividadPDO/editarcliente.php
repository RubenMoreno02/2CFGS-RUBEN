<?php
include "Conexion.class.php";

$pdo = Conexion::conectar();

$errores = [];


$dni = $_GET["dni"];

// Traure dades del client
$sql = $pdo->prepare("SELECT * FROM clientes WHERE dni=?");
$sql->execute([$dni]);
$cliente = $sql->fetch();

if (!$cliente) {
    echo "Este cliente no existe.";
    exit;
}

$nombre = $cliente["nombre"];
$correo = $cliente["correo"];

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    $nombre = $_POST["nombre"];
    $correo = $_POST["correo"];

    if ($nombre == "") {
        $errores[] = "El nombre no puede estar vacío.";
    }

    if ($correo == "") {
        $errores[] = "El correo no puede estar vacío.";
    }

    if (count($errores) == 0) {

        $upd = $pdo->prepare("UPDATE clientes SET nombre=?, correo=? WHERE dni=?");
        $upd->execute([$nombre, $correo, $dni]);

        header("Location: index.php");
        exit;
    }
}

?>
<h1>Editar client</h1>

<form method="POST">
    <link rel="stylesheet" href="style.css">

    <label>DNI (no modificable):</label><br>
    <input type="text" value="<?php echo $dni ?>" disabled><br><br>

    <label>Nombre:</label><br>
    <input type="text" name="nombre" value="<?php echo $nombre ?>"><br><br>

    <label>Correo:</label><br>
    <input type="email" name="correo" value="<?php echo $correo ?>"><br><br>

    <input type="submit" value="Guardar">
</form>

<?php
foreach ($errores as $e) {
    echo "<p style='color:red'>" . $e . "</p>";
}
?>