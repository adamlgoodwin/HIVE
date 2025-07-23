-- Fix: Create the missing course_order_metadata table
-- Run this in Supabase SQL Editor

-- 1. Create the metadata table
CREATE TABLE IF NOT EXISTS course_order_metadata (
  id TEXT PRIMARY KEY DEFAULT 'main',
  first_course_id TEXT REFERENCES courses(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Add helpful indexes
CREATE INDEX IF NOT EXISTS idx_course_order_metadata_first ON course_order_metadata(first_course_id);

-- 3. Initialize the linked list from existing order_index data
WITH ordered_courses AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY order_index ASC) as rn
  FROM courses 
  WHERE order_index IS NOT NULL
),
linked_courses AS (
  SELECT 
    curr.id,
    next_course.id as next_course_id
  FROM ordered_courses curr
  LEFT JOIN ordered_courses next_course ON next_course.rn = curr.rn + 1
)
UPDATE courses 
SET next_course_id = linked_courses.next_course_id
FROM linked_courses 
WHERE courses.id = linked_courses.id;

-- 4. Set the first course in metadata
INSERT INTO course_order_metadata (id, first_course_id)
SELECT 'main', id 
FROM courses 
ORDER BY order_index ASC 
LIMIT 1
ON CONFLICT (id) DO UPDATE SET 
  first_course_id = EXCLUDED.first_course_id,
  updated_at = NOW();

-- 5. Verify the fix
SELECT 'Fix Complete' as status;
SELECT 'First Course:' as info, first_course_id FROM course_order_metadata WHERE id = 'main';

-- 6. Show the linked list chain
WITH RECURSIVE course_chain AS (
  -- Start with first course
  SELECT 
    c.id, c.title, c.next_course_id, 1 as position
  FROM courses c
  JOIN course_order_metadata m ON c.id = m.first_course_id
  WHERE m.id = 'main'
  
  UNION ALL
  
  -- Follow the chain
  SELECT 
    c.id, c.title, c.next_course_id, cc.position + 1
  FROM courses c
  JOIN course_chain cc ON c.id = cc.next_course_id
)
SELECT position, id, title, next_course_id
FROM course_chain 
ORDER BY position;
