<!DOCTYPE html>
<html>
<head>
    <title>Nueva visita</title>
</head>
<body>
    <h1>Escribe tu comentario</h1>

    <form action="insertar_visita.php" method="POST">
        <textarea name="comentario" rows="5" cols="40" required></textarea><br><br>
        <button type="submit">Enviar</button>
    </form>

    <p><a href="libro_visitas.php">Volver al libro de visitas</a></p>
</body>
</html>
