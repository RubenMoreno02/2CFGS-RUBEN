CREATE DATABASE clientesdb;

USE clientesdb;

CREATE TABLE clientes (
    dni VARCHAR(9) PRIMARY KEY,
    nombre VARCHAR(50),
    correo VARCHAR(50)
);

INSERT INTO clientes VALUES
('98765432A','Rubén','ruben@gmail.com');