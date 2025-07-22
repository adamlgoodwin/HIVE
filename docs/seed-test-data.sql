-- Comprehensive Test Data for RBAC System
-- Creates test users, organizations, and role assignments for development

-- =====================================================
-- TEST ORGANIZATIONS
-- =====================================================

-- Insert test schools and organizations
INSERT INTO organizations (id, name, slug, description, org_type, domain, is_active) VALUES
('11111111-1111-1111-1111-111111111111', 'Riverside Elementary', 'riverside-elementary', 'A progressive elementary school focusing on STEM education', 'school', 'riverside.edu', true),
('22222222-2222-2222-2222-222222222222', 'Metro High School', 'metro-high', 'Large metropolitan high school with diverse programs', 'school', 'metrohigh.edu', true),
('33333333-3333-3333-3333-333333333333', 'TechEd Online Program', 'teched-online', 'Online technology education program', 'program', 'teched.com', true),
('44444444-4444-4444-4444-444444444444', 'City School District', 'city-district', 'Municipal school district administration', 'district', 'cityschools.gov', true)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    org_type = EXCLUDED.org_type,
    domain = EXCLUDED.domain,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- =====================================================
-- TEST USER PROFILES
-- Note: These assume the users have been created in Supabase Auth
-- You'll need to sign up these users through the app first, then run this
-- =====================================================

-- Platform Admin
INSERT INTO user_profiles (id, email, first_name, last_name, display_name, is_platform_admin, onboarding_completed) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'adamlukegoodwin@gmail.com', 'Adam', 'Goodwin', 'Adam (Platform Admin)', true, true)
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    display_name = EXCLUDED.display_name,
    is_platform_admin = EXCLUDED.is_platform_admin,
    onboarding_completed = EXCLUDED.onboarding_completed,
    updated_at = NOW();

-- School Administrators
INSERT INTO user_profiles (id, email, first_name, last_name, display_name, is_platform_admin, onboarding_completed) VALUES
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'school1@test.com', 'Sarah', 'Johnson', 'Sarah (School Admin)', false, true),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'school2@test.com', 'Michael', 'Chen', 'Michael (School Admin)', false, true)
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    display_name = EXCLUDED.display_name,
    is_platform_admin = EXCLUDED.is_platform_admin,
    onboarding_completed = EXCLUDED.onboarding_completed,
    updated_at = NOW();

-- Staff Members
INSERT INTO user_profiles (id, email, first_name, last_name, display_name, is_platform_admin, onboarding_completed) VALUES
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'staff1@test.com', 'Lisa', 'Rodriguez', 'Lisa (Staff)', false, true),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'staff2@test.com', 'James', 'Wilson', 'James (Staff)', false, true)
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    display_name = EXCLUDED.display_name,
    is_platform_admin = EXCLUDED.is_platform_admin,
    onboarding_completed = EXCLUDED.onboarding_completed,
    updated_at = NOW();

-- Teachers
INSERT INTO user_profiles (id, email, first_name, last_name, display_name, is_platform_admin, onboarding_completed) VALUES
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'teacher1@test.com', 'Emily', 'Davis', 'Emily (Math Teacher)', false, true),
('gggggggg-gggg-gggg-gggg-gggggggggggg', 'teacher2@test.com', 'Robert', 'Martinez', 'Robert (Science Teacher)', false, true),
('hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 'teacher3@test.com', 'Jennifer', 'Lee', 'Jennifer (English Teacher)', false, true)
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    display_name = EXCLUDED.display_name,
    is_platform_admin = EXCLUDED.is_platform_admin,
    onboarding_completed = EXCLUDED.onboarding_completed,
    updated_at = NOW();

-- Students/Learners
INSERT INTO user_profiles (id, email, first_name, last_name, display_name, is_platform_admin, onboarding_completed) VALUES
('iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii', 'student1@test.com', 'Alex', 'Thompson', 'Alex (Student)', false, true),
('jjjjjjjj-jjjj-jjjj-jjjj-jjjjjjjjjjjj', 'student2@test.com', 'Maya', 'Patel', 'Maya (Student)', false, true),
('kkkkkkkk-kkkk-kkkk-kkkk-kkkkkkkkkkkk', 'student3@test.com', 'Daniel', 'Kim', 'Daniel (Student)', false, true)
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    display_name = EXCLUDED.display_name,
    is_platform_admin = EXCLUDED.is_platform_admin,
    onboarding_completed = EXCLUDED.onboarding_completed,
    updated_at = NOW();

-- Observers/Parents
INSERT INTO user_profiles (id, email, first_name, last_name, display_name, is_platform_admin, onboarding_completed) VALUES
('llllllll-llll-llll-llll-llllllllllll', 'parent1@test.com', 'Maria', 'Thompson', 'Maria (Parent)', false, true),
('mmmmmmmm-mmmm-mmmm-mmmm-mmmmmmmmmmmm', 'parent2@test.com', 'David', 'Patel', 'David (Parent)', false, true)
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    display_name = EXCLUDED.display_name,
    is_platform_admin = EXCLUDED.is_platform_admin,
    onboarding_completed = EXCLUDED.onboarding_completed,
    updated_at = NOW();

-- =====================================================
-- ROLE ASSIGNMENTS
-- =====================================================

-- School Admins
INSERT INTO user_organization_roles (id, user_id, organization_id, role, is_active) VALUES
('r1111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'school_admin', true),
('r2222222-2222-2222-2222-222222222222', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', 'school_admin', true)
ON CONFLICT (id) DO UPDATE SET
    user_id = EXCLUDED.user_id,
    organization_id = EXCLUDED.organization_id,
    role = EXCLUDED.role,
    is_active = EXCLUDED.is_active;

-- Staff Members
INSERT INTO user_organization_roles (id, user_id, organization_id, role, is_active) VALUES
('r3333333-3333-3333-3333-333333333333', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '11111111-1111-1111-1111-111111111111', 'staff', true),
('r4444444-4444-4444-4444-444444444444', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '22222222-2222-2222-2222-222222222222', 'staff', true)
ON CONFLICT (id) DO UPDATE SET
    user_id = EXCLUDED.user_id,
    organization_id = EXCLUDED.organization_id,
    role = EXCLUDED.role,
    is_active = EXCLUDED.is_active;

-- Teachers
INSERT INTO user_organization_roles (id, user_id, organization_id, role, is_active) VALUES
('r5555555-5555-5555-5555-555555555555', 'ffffffff-ffff-ffff-ffff-ffffffffffff', '11111111-1111-1111-1111-111111111111', 'teacher', true),
('r6666666-6666-6666-6666-666666666666', 'gggggggg-gggg-gggg-gggg-gggggggggggg', '11111111-1111-1111-1111-111111111111', 'teacher', true),
('r7777777-7777-7777-7777-777777777777', 'hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', '22222222-2222-2222-2222-222222222222', 'teacher', true)
ON CONFLICT (id) DO UPDATE SET
    user_id = EXCLUDED.user_id,
    organization_id = EXCLUDED.organization_id,
    role = EXCLUDED.role,
    is_active = EXCLUDED.is_active;

-- Students/Learners
INSERT INTO user_organization_roles (id, user_id, organization_id, role, is_active) VALUES
('r8888888-8888-8888-8888-888888888888', 'iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii', '11111111-1111-1111-1111-111111111111', 'learner', true),
('r9999999-9999-9999-9999-999999999999', 'jjjjjjjj-jjjj-jjjj-jjjj-jjjjjjjjjjjj', '11111111-1111-1111-1111-111111111111', 'learner', true),
('raaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaab', 'kkkkkkkk-kkkk-kkkk-kkkk-kkkkkkkkkkkk', '22222222-2222-2222-2222-222222222222', 'learner', true)
ON CONFLICT (id) DO UPDATE SET
    user_id = EXCLUDED.user_id,
    organization_id = EXCLUDED.organization_id,
    role = EXCLUDED.role,
    is_active = EXCLUDED.is_active;

-- =====================================================
-- OBSERVER RELATIONSHIPS (PARENTS → CHILDREN)
-- =====================================================

INSERT INTO observer_relationships (id, observer_id, learner_id, organization_id, relationship_type, is_active) VALUES
('o1111111-1111-1111-1111-111111111111', 'llllllll-llll-llll-llll-llllllllllll', 'iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii', '11111111-1111-1111-1111-111111111111', 'parent', true),
('o2222222-2222-2222-2222-222222222222', 'mmmmmmmm-mmmm-mmmm-mmmm-mmmmmmmmmmmm', 'jjjjjjjj-jjjj-jjjj-jjjj-jjjjjjjjjjjj', '11111111-1111-1111-1111-111111111111', 'parent', true)
ON CONFLICT (id) DO UPDATE SET
    observer_id = EXCLUDED.observer_id,
    learner_id = EXCLUDED.learner_id,
    organization_id = EXCLUDED.organization_id,
    relationship_type = EXCLUDED.relationship_type,
    is_active = EXCLUDED.is_active;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Show all organizations
SELECT 'Organizations:' as section, name, slug, org_type FROM organizations ORDER BY name;

-- Show all user profiles
SELECT 'User Profiles:' as section, display_name, email, is_platform_admin FROM user_profiles ORDER BY display_name;

-- Show role assignments
SELECT 'Role Assignments:' as section, 
       up.display_name as user_name,
       o.name as organization_name,
       uor.role,
       uor.is_active
FROM user_organization_roles uor
JOIN user_profiles up ON up.id = uor.user_id  
JOIN organizations o ON o.id = uor.organization_id
ORDER BY o.name, uor.role, up.display_name;

-- Show observer relationships
SELECT 'Observer Relationships:' as section,
       observer.display_name as observer_name,
       learner.display_name as learner_name,
       o.name as organization_name,
       or_.relationship_type
FROM observer_relationships or_
JOIN user_profiles observer ON observer.id = or_.observer_id
JOIN user_profiles learner ON learner.id = or_.learner_id
LEFT JOIN organizations o ON o.id = or_.organization_id
WHERE or_.is_active = true
ORDER BY observer.display_name, learner.display_name;
