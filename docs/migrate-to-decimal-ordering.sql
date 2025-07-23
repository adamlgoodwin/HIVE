-- Migration: Update order_index to support decimal values
-- This allows for much more flexible row ordering with decimal precision
-- Run this in Supabase SQL Editor

-- 1. Update the courses table to support decimal order_index
ALTER TABLE courses 
ALTER COLUMN order_index TYPE DECIMAL(10,6);

-- 2. Add comment for documentation
COMMENT ON COLUMN courses.order_index IS 'Decimal ordering index for flexible row positioning. Supports up to 6 decimal places.';

-- 3. Update existing integer values to have proper spacing (optional, for clean start)
UPDATE courses 
SET order_index = CAST(order_index AS DECIMAL(10,6))
WHERE order_index IS NOT NULL;

-- 4. Verify the change
SELECT 
    column_name, 
    data_type, 
    numeric_precision, 
    numeric_scale
FROM information_schema.columns 
WHERE table_name = 'courses' AND column_name = 'order_index';

-- 5. Test decimal insertion
SELECT * FROM courses ORDER BY order_index;

-- Expected result: order_index should now accept values like 1.5, 2.25, 3.125, etc.
