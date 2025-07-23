-- EMERGENCY FIX: Diagnose and repair corrupted linked list chain
-- Run this in Supabase SQL Editor

-- 1. DIAGNOSE: Show current chain state
SELECT 'CURRENT CHAIN STATE:' as info;
SELECT id, title, next_course_id, order_index 
FROM courses 
ORDER BY order_index;

-- 2. Show metadata
SELECT 'METADATA:' as info;
SELECT * FROM course_order_metadata;

-- 3. DETECT CIRCULAR REFERENCES
WITH RECURSIVE chain_check AS (
  -- Start from first course
  SELECT 
    c.id, 
    c.next_course_id,
    1 as depth,
    c.id as path
  FROM courses c
  JOIN course_order_metadata m ON c.id = m.first_course_id
  WHERE m.id = 'main'
  
  UNION ALL
  
  -- Follow chain and detect cycles
  SELECT 
    c.id,
    c.next_course_id,
    cc.depth + 1,
    cc.path || ' -> ' || c.id
  FROM courses c
  JOIN chain_check cc ON c.id = cc.next_course_id
  WHERE cc.depth < 20  -- Prevent infinite recursion
)
SELECT 'CHAIN TRAVERSAL (looking for cycles):' as info;
SELECT depth, id, next_course_id, path FROM chain_check ORDER BY depth;

-- 4. NUCLEAR OPTION: Clear all linked list data
SELECT 'CLEARING ALL LINKED LIST DATA...' as status;

-- Reset all next_course_id to NULL
UPDATE courses SET next_course_id = NULL;

-- Clear metadata
DELETE FROM course_order_metadata WHERE id = 'main';

-- 5. REBUILD from order_index (clean slate)
SELECT 'REBUILDING FROM SCRATCH...' as status;

-- Get courses ordered by order_index
WITH ordered_courses AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY order_index ASC) as rn
  FROM courses 
  WHERE order_index IS NOT NULL
)
-- Set next_course_id for each course (point to next in sequence)
UPDATE courses 
SET next_course_id = next_course.id
FROM (
  SELECT 
    curr.id as curr_id,
    next_course.id as next_id
  FROM ordered_courses curr
  LEFT JOIN ordered_courses next_course ON next_course.rn = curr.rn + 1
) as chain_data
WHERE courses.id = chain_data.curr_id
AND chain_data.next_id IS NOT NULL;

-- Set first course in metadata
INSERT INTO course_order_metadata (id, first_course_id)
SELECT 'main', id 
FROM courses 
ORDER BY order_index ASC 
LIMIT 1;

-- 6. VERIFY the fix
SELECT 'VERIFICATION - NEW CHAIN STATE:' as info;
SELECT id, title, next_course_id, order_index 
FROM courses 
ORDER BY order_index;

SELECT 'NEW METADATA:' as info;
SELECT * FROM course_order_metadata;

-- 7. TEST TRAVERSAL (should not have cycles now)
WITH RECURSIVE chain_verification AS (
  SELECT 
    c.id, 
    c.title,
    c.next_course_id,
    1 as position
  FROM courses c
  JOIN course_order_metadata m ON c.id = m.first_course_id
  WHERE m.id = 'main'
  
  UNION ALL
  
  SELECT 
    c.id,
    c.title,
    c.next_course_id,
    cv.position + 1
  FROM courses c
  JOIN chain_verification cv ON c.id = cv.next_course_id
  WHERE cv.position < 50  -- Safety limit
)
SELECT 'FINAL CHAIN VERIFICATION:' as info;
SELECT position, id, title, next_course_id FROM chain_verification ORDER BY position;
