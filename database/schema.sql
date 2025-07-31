-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS mentorai_db;
USE mentorai_db;

-- Tabla de clases
CREATE TABLE IF NOT EXISTS classes (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    teacher VARCHAR(255) NOT NULL,
    description TEXT,
    subject VARCHAR(100),
    grade_level VARCHAR(50),
    duration INT, -- en minutos
    status ENUM('active', 'inactive') DEFAULT 'active',
    recording_url TEXT,
    transcript LONGTEXT,
    analysis_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_teacher (teacher),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- Tabla de usuarios (para futuras funcionalidades)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role ENUM('teacher', 'admin', 'student') DEFAULT 'teacher',
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
);

-- Tabla de análisis de clases (para almacenar análisis detallados)
CREATE TABLE IF NOT EXISTS class_analyses (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    class_id VARCHAR(36) NOT NULL,
    analysis_type ENUM('transcript', 'participation', 'rubric', 'swot', 'feedback360', 'portfolio', 'ecdf', 'insights') NOT NULL,
    analysis_data JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    INDEX idx_class_id (class_id),
    INDEX idx_analysis_type (analysis_type)
);

-- Tabla de momentos destacados
CREATE TABLE IF NOT EXISTS class_moments (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    class_id VARCHAR(36) NOT NULL,
    moment_type VARCHAR(100) NOT NULL,
    timestamp INT, -- tiempo en segundos desde el inicio
    description TEXT,
    data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    INDEX idx_class_id (class_id),
    INDEX idx_moment_type (moment_type)
);

-- Insertar algunos datos de ejemplo
INSERT INTO classes (name, teacher, description, subject, grade_level, duration) VALUES
('Introducción a la Programación', 'Dr. María González', 'Clase introductoria sobre conceptos básicos de programación', 'Informática', 'Universidad', 90),
('Matemáticas Avanzadas', 'Prof. Carlos Rodríguez', 'Análisis de funciones y derivadas', 'Matemáticas', 'Bachillerato', 60),
('Historia del Arte', 'Lic. Ana Martínez', 'Exploración de movimientos artísticos del siglo XX', 'Arte', 'Universidad', 75);

-- Los usuarios se crearán mediante el script createUsers.ts
-- para asegurar que las contraseñas estén correctamente hasheadas 