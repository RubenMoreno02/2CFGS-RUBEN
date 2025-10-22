<?php
class Cliente {
    private $dni;
    private $nombre;
    private $apellidos;
    private $direccion;
    private $localidad;
    private $email;
    private $telefono;
    private $fecha_nac;

    // Constructor
    public function __construct() {
        
    }

    // Getters
    public function getDni() { return $this->dni; }
    public function getNombre() { return $this->nombre; }
    public function getApellidos() { return $this->apellidos; }
    public function getDireccion() { return $this->direccion; }
    public function getLocalidad() { return $this->localidad; }
    public function getEmail() { return $this->email; }
    public function getTelefono() { return $this->telefono; }
    public function getFechaNac() { return $this->fecha_nac; }

    // Setters
    public function setDni($dni) { $this->dni = $dni; }
    public function setNombre($nombre) { $this->nombre = $nombre; }
    public function setApellidos($apellidos) { $this->apellidos = $apellidos; }
    public function setDireccion($direccion) { $this->direccion = $direccion; }
    public function setLocalidad($localidad) { $this->localidad = $localidad; }
    public function setEmail($email) { $this->email = $email; }
    public function setTelefono($telefono) { $this->telefono = $telefono; }
    public function setFechaNac($fecha_nac) { $this->fecha_nac = $fecha_nac; }

    // Método para obtener nombre completo
    public function getNombreCompleto() {
        return $this->nombre . ' ' . $this->apellidos;
    }
}
?>