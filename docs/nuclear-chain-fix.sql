-- NUCLEAR OPTION: Completely destroy and rebuild linked list chain
-- This will fix ANY corruption by starting from absolute scratch

-- 1. IDENTIFY the problematic course
SELECT 'PROBLEMATIC COURSE:' as info;
SELECT id, title, next_course_id, order_index 
FROM courses 
WHERE id = 'NEW1753237002832_u0r0ls6hs';

-- 2. NUCLEAR: Set ALL next_course_id to NULL (break all links)
UPDATE courses SET next_course_id = NULL;

-- 3. DELETE metadata completely  
DELETE FROM course_order_metadata;

-- 4. VERIFY all links are broken
SELECT 'VERIFICATION - ALL LINKS SHOULD BE NULL:' as info;
SELECT id, title, next_course_id FROM courses WHERE next_course_id IS NOT NULL;

-- 5. CLEAN REBUILD: Use a completely different approach
-- Get courses in order_index sequence and rebuild one by one
DO $$
DECLARE
    course_rec RECORD;
    prev_id TEXT := NULL;
    first_id TEXT := NULL;
BEGIN
    -- Loop through courses in order_index sequence
    FOR course_rec IN 
        SELECT id FROM courses 
        WHERE order_index IS NOT NULL 
        ORDER BY order_index ASC
    LOOP
        -- Set the previous course to point to this one
        IF prev_id IS NOT NULL THEN
            UPDATE courses 
            SET next_course_id = course_rec.id 
            WHERE id = prev_id;
        ELSE 
            -- This is the first course
            first_id := course_rec.id;
        END IF;
        
        -- Update for next iteration
        prev_id := course_rec.id;
    END LOOP;
    
    -- Set the first course in metadata
    INSERT INTO course_order_metadata (id, first_course_id) 
    VALUES ('main', first_id);
    
    RAISE NOTICE 'Chain rebuilt successfully with first course: %', first_id;
END $$;

-- 6. FINAL VERIFICATION
SELECT 'FINAL CHAIN STATE:' as info;
SELECT id, title, next_course_id, order_index 
FROM courses 
ORDER BY order_index;

SELECT 'METADATA:' as info;  
SELECT * FROM course_order_metadata;

-- 7. MANUAL TRAVERSAL TEST (should show clean sequence)
WITH RECURSIVE clean_chain AS (
    SELECT 
        c.id, 
        c.title,
        c.next_course_id,
        1 as position,
        c.id as path
    FROM courses c
    JOIN course_order_metadata m ON c.id = m.first_course_id
    WHERE m.id = 'main'
    
    UNION ALL
    
    SELECT 
        c.id,
        c.title, 
        c.next_course_id,
        cc.position + 1,
        cc.path || ' -> ' || c.id
    FROM courses c
    JOIN clean_chain cc ON c.id = cc.next_course_id
    WHERE cc.position < 20  -- Safety limit
)
SELECT 'CLEAN CHAIN TRAVERSAL:' as info;
SELECT position, id, title, next_course_id, path 
FROM clean_chain 
ORDER BY position;
