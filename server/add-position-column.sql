-- Add position column to customer table
ALTER TABLE customer ADD COLUMN position VARCHAR(100) NULL AFTER email;