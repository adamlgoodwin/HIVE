-- Migration: Linked-List Ordering System
-- The ultimate solution - no more numeric ordering headaches!

-- 1. Add the next_course_id column to courses table
ALTER TABLE courses ADD COLUMN next_course_id TEXT REFERENCES courses(id);

-- 2. Create metadata table to track the first course
CREATE TABLE course_order_metadata (
  id TEXT PRIMARY KEY DEFAULT 'main',
  first_course_id TEXT REFERENCES courses(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Migrate existing data to linked list structure
-- Get current courses ordered by order_index
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

-- 5. Optional: Remove old order_index column (keep it for now as backup)
-- ALTER TABLE courses DROP COLUMN order_index;

-- 6. Add helpful indexes
CREATE INDEX idx_courses_next_course_id ON courses(next_course_id);
CREATE INDEX idx_course_order_metadata_first ON course_order_metadata(first_course_id);

-- 7. Verify the migration
SELECT 
  'Migration Verification' as status,
  (SELECT COUNT(*) FROM courses) as total_courses,
  (SELECT COUNT(*) FROM courses WHERE next_course_id IS NOT NULL) as courses_with_next,
  (SELECT first_course_id FROM course_order_metadata WHERE id = 'main') as first_course
;

-- 8. Show the linked list structure
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

COMMENT ON TABLE course_order_metadata IS 'Tracks the first course in the linked list for O(1) ordering operations';
COMMENT ON COLUMN courses.next_course_id IS 'Points to the next course in the ordered sequence. NULL = last course';
