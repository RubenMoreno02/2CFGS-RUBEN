-- Crear base de datos
CREATE DATABASE IF NOT EXISTS clientes_db;
USE clientes_db;

-- Crear usuario específico para esta base de datos
CREATE USER IF NOT EXISTS 'cliente_user'@'localhost' IDENTIFIED BY 'cliente_pass123';
GRANT ALL PRIVILEGES ON clientes_db.* TO 'cliente_user'@'localhost';
FLUSH PRIVILEGES;

-- Crear tabla clientes
CREATE TABLE IF NOT EXISTS clientes (
    dni VARCHAR(9) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    direccion VARCHAR(200),
    localidad VARCHAR(100),
    email VARCHAR(100) NOT NULL,
    telefono VARCHAR(15),
    fecha_nac DATE
);

-- Insertar algunos datos de ejemplo
INSERT INTO clientes (dni, nombre, apellidos, direccion, localidad, email, telefono, fecha_nac) VALUES
('12345678A', 'Lukas', 'Tamulatis Volkov', 'Calle Mayor 123', 'Oliva', 'lukas.tam@email.com', '912345678', '2003-09-25'),
('87654321B', 'Adrián', 'Navarro Girau', 'Avenida Sol 45', 'Oliva', 'adrian.navarro@email.com', '934567890', '2001-08-26'),
('56781234C', 'Pau', 'Morant LLorca', 'Plaza España 67', 'Oliva', 'pau.morant@email.com', '961234567', '2003-09-25	');
