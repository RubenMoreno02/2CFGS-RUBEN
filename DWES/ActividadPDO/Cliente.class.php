<?php
class Cliente {
    private $dni;
    private $nombre;
    private $correo;

    public function __construct($dni, $nombre, $correo) {
        $this->dni = $dni;
        $this->nombre = $nombre;
        $this->correo = $correo;
    }

    public function getDni() { return $this->dni; }
    public function getNombre() { return $this->nombre; }
    public function getCorreo() { return $this->correo; }

    public static function getTodos() {
        $pdo = Conexion::conectar();
        $stmt = $pdo->prepare("SELECT * FROM clientes");
        $stmt->execute();
        $lista = [];
        while ($fila = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $lista[] = new Cliente($fila['dni'], $fila['nombre'], $fila['correo']);
        }
        return $lista;
    }
}
?>