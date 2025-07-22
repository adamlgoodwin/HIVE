-- Fix RLS Policies for Development (Anonymous Access)
-- Run this in Supabase SQL Editor

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Allow authenticated users to insert courses" ON courses;
DROP POLICY IF EXISTS "Allow authenticated users to update courses" ON courses;
DROP POLICY IF EXISTS "Allow authenticated users to delete courses" ON courses;
DROP POLICY IF EXISTS "Users can manage their own layouts" ON user_layouts;

-- Create new policies that allow anonymous operations for development
-- COURSES TABLE POLICIES

-- Allow anyone to read courses
CREATE POLICY "Allow public read access to courses" ON courses
    FOR SELECT USING (true);

-- Allow anyone to insert courses (for development)
CREATE POLICY "Allow public insert access to courses" ON courses
    FOR INSERT WITH CHECK (true);

-- Allow anyone to update courses (for development)
CREATE POLICY "Allow public update access to courses" ON courses
    FOR UPDATE USING (true) WITH CHECK (true);

-- Allow anyone to delete courses (for development)
CREATE POLICY "Allow public delete access to courses" ON courses
    FOR DELETE USING (true);

-- USER_LAYOUTS TABLE POLICIES

-- Allow anyone to read user_layouts (for development)
CREATE POLICY "Allow public read access to user_layouts" ON user_layouts
    FOR SELECT USING (true);

-- Allow anyone to insert user_layouts (for development)
CREATE POLICY "Allow public insert access to user_layouts" ON user_layouts
    FOR INSERT WITH CHECK (true);

-- Allow anyone to update user_layouts (for development)
CREATE POLICY "Allow public update access to user_layouts" ON user_layouts
    FOR UPDATE USING (true) WITH CHECK (true);

-- Allow anyone to delete user_layouts (for development)
CREATE POLICY "Allow public delete access to user_layouts" ON user_layouts
    FOR DELETE USING (true);

-- Verify policies are created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename IN ('courses', 'user_layouts');
