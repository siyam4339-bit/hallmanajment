-- Hall Management Database Schema
-- Generated for the backend API in backend/index.js

CREATE DATABASE IF NOT EXISTS `hall_management`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_general_ci;
USE `hall_management`;

CREATE TABLE `users` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(100) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `role` VARCHAR(50) NOT NULL DEFAULT 'student',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `applications` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `student_id` VARCHAR(100) NOT NULL,
  `edu_email` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(255) NOT NULL,
  `department` VARCHAR(255) NOT NULL,
  `semester` VARCHAR(50) NOT NULL,
  `mobile_number` VARCHAR(50) NOT NULL,
  `blood_group` VARCHAR(50) NOT NULL,
  `status` ENUM('pending','approved','rejected','Cancelled') NOT NULL DEFAULT 'pending',
  PRIMARY KEY (`id`),
  KEY `idx_applications_user_id` (`user_id`),
  CONSTRAINT `fk_applications_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `students` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `application_id` INT UNSIGNED NOT NULL,
  `room_number` VARCHAR(100) NOT NULL,
  `hall_name` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_students_application_id` (`application_id`),
  CONSTRAINT `fk_students_application` FOREIGN KEY (`application_id`) REFERENCES `applications` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_students_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `complaints` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `complaint_text` TEXT NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_complaints_user_id` (`user_id`),
  CONSTRAINT `fk_complaints_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
