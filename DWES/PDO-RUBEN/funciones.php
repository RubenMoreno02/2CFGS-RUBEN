<?php
require_once 'Cliente.php';

function conectarBD() {
    try {
        $pdo = new PDO('mysql:host=localhost;dbname=clientes_db;charset=utf8', 
                       'cliente_user', 'cliente_pass123');
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        return $pdo;
    } catch (PDOException $e) {
        die('Error de conexión: ' . $e->getMessage());
    }
}


function desconectarBD($pdo) {
    $pdo = null;
}

function obtenerClientes() {
    $pdo = conectarBD();
    try {
        $stmt = $pdo->prepare('SELECT * FROM clientes ORDER BY apellidos, nombre');
        $stmt->execute();
        
       
        $stmt->setFetchMode(PDO::FETCH_CLASS, 'Cliente');
        
        $clientes = $stmt->fetchAll();
        /*
        while ($cliente = $stmt->fetch()) {
            $clientes[] = $cliente;
        }*/
        
        return $clientes;
    } catch (PDOException $e) {
        echo 'Error al obtener clientes: ' . $e->getMessage();
        return [];
    } finally {
        desconectarBD($pdo);
    }
}

function validarDNI($dni) {
    $dni = strtoupper(trim($dni));
    
    // Verificar longitud
    if (strlen($dni) != 9) {
        return false;
    }
    
    $numero = substr($dni, 0, 8);
    $letra = substr($dni, 8, 1);
    
    // Verificar que los primeros 8 caracteres son números
    if (!ctype_digit($numero)) {
        return false;
    }
    
    // Verificar que el último carácter es una letra
    if (!ctype_alpha($letra)) {
        return false;
    }
    
    // Calcular letra correcta
    $letras = "TRWAGMYFPDXBNJZSQVHLCKE";
    $letraCalculada = $letras[$numero % 23];
    
    // Debug: puedes agregar esto temporalmente para ver qué está pasando
    // error_log("DNI: $dni, Número: $numero, Letra: $letra, Letra Calculada: $letraCalculada");
    
    return $letraCalculada === $letra;
}

function dniExiste($dni, $pdo, $excluir_dni = null) {
    try {
        if ($excluir_dni) {
            $stmt = $pdo->prepare('SELECT COUNT(*) FROM clientes WHERE dni = :dni AND dni != :excluir_dni');
            $stmt->execute([':dni' => $dni, ':excluir_dni' => $excluir_dni]);
        } else {
            $stmt = $pdo->prepare('SELECT COUNT(*) FROM clientes WHERE dni = :dni');
            $stmt->execute([':dni' => $dni]);
        }
        return $stmt->fetchColumn() > 0;
    } catch (PDOException $e) {
        return false;
    }
}
?>