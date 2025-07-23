-- SIMPLE FIX: Just reset everything and rebuild clean
-- Copy and paste this entire block into Supabase SQL Editor

-- 1. Show current problem
SELECT 'Before fix - courses with next_course_id:' as info;
SELECT id, title, next_course_id, order_index FROM courses WHERE next_course_id IS NOT NULL ORDER BY order_index;

-- 2. NUCLEAR: Clear everything
UPDATE courses SET next_course_id = NULL;
DELETE FROM course_order_metadata WHERE id = 'main';

-- 3. Rebuild from scratch in proper order
WITH ordered_courses AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY order_index ASC) as rn
  FROM courses 
  ORDER BY order_index ASC
)
-- Set each course to point to the next one
UPDATE courses 
SET next_course_id = subq.next_id
FROM (
  SELECT 
    curr.id as curr_id,
    next_course.id as next_id
  FROM ordered_courses curr
  LEFT JOIN ordered_courses next_course ON next_course.rn = curr.rn + 1
) as subq
WHERE courses.id = subq.curr_id 
AND subq.next_id IS NOT NULL;

-- 4. Set first course
INSERT INTO course_order_metadata (id, first_course_id)
SELECT 'main', id FROM courses ORDER BY order_index ASC LIMIT 1;

-- 5. Verify fix
SELECT 'After fix - chain should be clean:' as info;
SELECT id, title, next_course_id, order_index FROM courses ORDER BY order_index;

SELECT 'Metadata:' as info;
SELECT * FROM course_order_metadata;
