-- Seed Database with Initial Course Data
-- Run this in Supabase SQL Editor to populate the courses table

-- Clear existing data (optional)
-- DELETE FROM courses;

-- Insert initial course data
INSERT INTO courses (id, title, instructor, order_index, created_at, updated_at) VALUES
('PHYS101', 'Physics', 'Dr. Smith', 1, NOW(), NOW()),
('CALC201', 'Calculus II', 'Prof. Johnson', 2, NOW(), NOW()),
('HIST301', 'History of Rome', 'Dr. Davis', 3, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    instructor = EXCLUDED.instructor,
    order_index = EXCLUDED.order_index,
    updated_at = NOW();

-- Verify the data was inserted
SELECT * FROM courses ORDER BY order_index;
