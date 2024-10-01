CREATE DATABASE BD_Proaula;
GO

USE BD_Proaula;
GO

CREATE TABLE Usuario (
    id_usuario INT PRIMARY KEY IDENTITY(1,1),
    nombre_usuario NVARCHAR(255) UNIQUE NOT NULL,
    contrasena NVARCHAR(255) NOT NULL,
    nombre NVARCHAR(100),
    apellido NVARCHAR(100),
    telefono NVARCHAR(20),
    direccion NVARCHAR(255),
    correo_electronico NVARCHAR(255) UNIQUE NOT NULL,
    rol NVARCHAR(20) CHECK (rol IN ('usuario', 'administrador', 'master')) DEFAULT 'usuario'
);

CREATE TABLE Hotel (
    id_hotel INT PRIMARY KEY IDENTITY(1,1),
    nombre_hotel NVARCHAR(255) NOT NULL,
    descripcion TEXT,
    direccion NVARCHAR(255),
    categoria NVARCHAR(50),
    calificacion_promedio DECIMAL(3, 2),
    numero_habitaciones INT
);

CREATE TABLE Habitacion (
    id_habitacion INT PRIMARY KEY IDENTITY(1,1),
    id_hotel INT,
    tipo_habitacion NVARCHAR(10) CHECK (tipo_habitacion IN ('individual', 'doble', 'suite')) NOT NULL,
    descripcion TEXT,
    precio_por_noche DECIMAL(10,2),
    estado_disponibilidad NVARCHAR(15) CHECK (estado_disponibilidad IN ('disponible', 'no disponible')) NOT NULL,
    FOREIGN KEY (id_hotel) REFERENCES Hotel(id_hotel)
);

CREATE TABLE Reserva (
    id_reserva INT PRIMARY KEY IDENTITY(1,1),
    id_usuario INT,
    id_habitacion INT,
    fecha_entrada DATE NOT NULL,
    fecha_salida DATE NOT NULL,
    numero_personas INT,
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario),
    FOREIGN KEY (id_habitacion) REFERENCES Habitacion(id_habitacion)
);

CREATE TABLE Pago (
    id_pago INT PRIMARY KEY IDENTITY(1,1),
    id_reserva INT,
    fecha_pago DATE NOT NULL,
    monto_total DECIMAL(10,2),
    metodo_pago NVARCHAR(20) CHECK (metodo_pago IN ('tarjeta de crédito', 'tarjeta de débito')) NOT NULL,
    estado_pago NVARCHAR(10) CHECK (estado_pago IN ('aprobado', 'rechazado')) DEFAULT 'aprobado',
    FOREIGN KEY (id_reserva) REFERENCES Reserva(id_reserva)
);

CREATE TABLE Opinion (
    id_opinion INT PRIMARY KEY IDENTITY(1,1),
    id_usuario INT,
    id_hotel INT,
    calificacion INT CHECK (calificacion BETWEEN 1 AND 5),
    comentario TEXT,
    fecha_opinion DATE NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario),
    FOREIGN KEY (id_hotel) REFERENCES Hotel(id_hotel)
	
);
INSERT INTO Usuario (nombre_usuario, contrasena, nombre, apellido, telefono, direccion, correo_electronico, rol)
VALUES ('master_admin', 'contraseñaSegura', 'Master', 'Admin', '123456789', 'Dirección del Master', 'master@correo.com', 'master');
Select*From Usuario