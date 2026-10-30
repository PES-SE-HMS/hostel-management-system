-- Hostel Management System - Sprint 1 schema (MySQL)
CREATE DATABASE IF NOT EXISTS hms;
USE hms;

CREATE TABLE IF NOT EXISTS users (
  user_id       INT AUTO_INCREMENT PRIMARY KEY,
  username      VARCHAR(50)  NOT NULL UNIQUE,
  password_hash VARCHAR(100) NOT NULL,
  full_name     VARCHAR(100) NOT NULL,
  role          ENUM('student','warden','admin','maintenance') NOT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS students (
  student_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NULL UNIQUE,
  srn        VARCHAR(20)  NOT NULL UNIQUE,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(100) NOT NULL UNIQUE,
  phone      VARCHAR(15),
  course     VARCHAR(100),
  year       TINYINT,
  guardian_name  VARCHAR(100),
  guardian_phone VARCHAR(15),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS rooms (
  room_id     INT AUTO_INCREMENT PRIMARY KEY,
  room_number VARCHAR(10) NOT NULL UNIQUE,
  block       VARCHAR(10) NOT NULL,
  floor       TINYINT NOT NULL,
  capacity    TINYINT NOT NULL
);

CREATE TABLE IF NOT EXISTS beds (
  bed_id     INT AUTO_INCREMENT PRIMARY KEY,
  room_id    INT NOT NULL,
  bed_number TINYINT NOT NULL,
  UNIQUE (room_id, bed_number),
  FOREIGN KEY (room_id) REFERENCES rooms(room_id) ON DELETE CASCADE
);

-- active_bed_id / active_student_id are non-NULL only while status = 'active',
-- so UNIQUE constraints block double allocation at DB level (FR-06).
CREATE TABLE IF NOT EXISTS allocations (
  allocation_id     INT AUTO_INCREMENT PRIMARY KEY,
  student_id        INT NOT NULL,
  bed_id            INT NOT NULL,
  status            ENUM('active','vacated') NOT NULL DEFAULT 'active',
  allocated_by      INT NOT NULL,
  allocated_on      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  vacated_on        TIMESTAMP NULL,
  active_bed_id     INT GENERATED ALWAYS AS (IF(status='active', bed_id, NULL)) STORED,
  active_student_id INT GENERATED ALWAYS AS (IF(status='active', student_id, NULL)) STORED,
  UNIQUE KEY uq_active_bed (active_bed_id),
  UNIQUE KEY uq_active_student (active_student_id),
  FOREIGN KEY (student_id)   REFERENCES students(student_id),
  FOREIGN KEY (bed_id)       REFERENCES beds(bed_id),
  FOREIGN KEY (allocated_by) REFERENCES users(user_id)
);
