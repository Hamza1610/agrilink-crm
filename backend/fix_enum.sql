-- SQL script to add 'general_inquiry' to session_type enum
-- Run this in your PostgreSQL database

ALTER TYPE session_type_enum ADD VALUE IF NOT EXISTS 'general_inquiry';
