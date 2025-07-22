-- Row Level Security Policies for Educational SaaS RBAC
-- Implements secure, role-based access control across multi-tenant architecture

-- =====================================================
-- USER PROFILES POLICIES
-- =====================================================

-- Enable RLS on user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile and profiles in their organizations
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- Platform admins can view all profiles
CREATE POLICY "Platform admins can view all profiles" ON user_profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND is_platform_admin = TRUE
        )
    );

-- Users can view profiles of people in their organizations
CREATE POLICY "Users can view org members" ON user_profiles
    FOR SELECT USING (
        id IN (
            SELECT DISTINCT uor2.user_id 
            FROM user_organization_roles uor1
            JOIN user_organization_roles uor2 ON uor1.organization_id = uor2.organization_id
            WHERE uor1.user_id = auth.uid() AND uor1.is_active = TRUE AND uor2.is_active = TRUE
        )
    );

-- =====================================================
-- ORGANIZATIONS POLICIES
-- =====================================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Users can view organizations they belong to
CREATE POLICY "Users can view their organizations" ON organizations
    FOR SELECT USING (
        id IN (
            SELECT organization_id FROM user_organization_roles 
            WHERE user_id = auth.uid() AND is_active = TRUE
        )
    );

-- Platform admins can manage all organizations
CREATE POLICY "Platform admins can manage organizations" ON organizations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND is_platform_admin = TRUE
        )
    );

-- School admins can update their organizations
CREATE POLICY "School admins can update their orgs" ON organizations
    FOR UPDATE USING (
        id IN (
            SELECT organization_id FROM user_organization_roles 
            WHERE user_id = auth.uid() 
            AND role = 'school_admin' 
            AND is_active = TRUE
        )
    );

-- =====================================================
-- USER ORGANIZATION ROLES POLICIES
-- =====================================================

ALTER TABLE user_organization_roles ENABLE ROW LEVEL SECURITY;

-- Users can view their own role memberships
CREATE POLICY "Users can view own roles" ON user_organization_roles
    FOR SELECT USING (user_id = auth.uid());

-- Users can view roles of others in their organizations
CREATE POLICY "Users can view org member roles" ON user_organization_roles
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM user_organization_roles 
            WHERE user_id = auth.uid() AND is_active = TRUE
        )
    );

-- Platform admins can manage all role assignments
CREATE POLICY "Platform admins can manage all roles" ON user_organization_roles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND is_platform_admin = TRUE
        )
    );

-- School admins can manage roles in their organizations
CREATE POLICY "School admins can manage org roles" ON user_organization_roles
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM user_organization_roles 
            WHERE user_id = auth.uid() 
            AND role = 'school_admin' 
            AND is_active = TRUE
        )
    );

-- =====================================================
-- OBSERVER RELATIONSHIPS POLICIES
-- =====================================================

ALTER TABLE observer_relationships ENABLE ROW LEVEL SECURITY;

-- Observers can view and manage their relationships
CREATE POLICY "Observers can manage their relationships" ON observer_relationships
    FOR ALL USING (observer_id = auth.uid());

-- Learners can view who is observing them
CREATE POLICY "Learners can view their observers" ON observer_relationships
    FOR SELECT USING (learner_id = auth.uid());

-- School admins can view relationships in their organizations
CREATE POLICY "School admins can view org relationships" ON observer_relationships
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM user_organization_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('school_admin', 'staff') 
            AND is_active = TRUE
        )
    );

-- Platform admins can manage all relationships
CREATE POLICY "Platform admins can manage all relationships" ON observer_relationships
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND is_platform_admin = TRUE
        )
    );

-- =====================================================
-- ORGANIZATION INVITATIONS POLICIES
-- =====================================================

ALTER TABLE organization_invitations ENABLE ROW LEVEL SECURITY;

-- Users with admin roles can view and manage invitations for their organizations
CREATE POLICY "Admins can manage org invitations" ON organization_invitations
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM user_organization_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('school_admin', 'staff') 
            AND is_active = TRUE
        )
    );

-- Platform admins can manage all invitations
CREATE POLICY "Platform admins can manage all invitations" ON organization_invitations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND is_platform_admin = TRUE
        )
    );

-- Allow public read access to validate invitation tokens (for acceptance flow)
CREATE POLICY "Public can validate invitation tokens" ON organization_invitations
    FOR SELECT USING (TRUE);

-- =====================================================
-- HELPER FUNCTIONS FOR AUTHORIZATION
-- =====================================================

-- Check if current user is platform admin
CREATE OR REPLACE FUNCTION is_platform_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = auth.uid() AND is_platform_admin = TRUE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if current user has specific role in organization
CREATE OR REPLACE FUNCTION has_org_role(org_id UUID, required_role user_role)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_organization_roles 
        WHERE user_id = auth.uid() 
        AND organization_id = org_id 
        AND role = required_role 
        AND is_active = TRUE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if current user can access learner data
CREATE OR REPLACE FUNCTION can_access_learner(learner_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Platform admin can access all
    IF is_platform_admin() THEN
        RETURN TRUE;
    END IF;
    
    -- Self access
    IF auth.uid() = learner_uuid THEN
        RETURN TRUE;
    END IF;
    
    -- Observer relationship
    IF EXISTS (
        SELECT 1 FROM observer_relationships 
        WHERE observer_id = auth.uid() 
        AND learner_id = learner_uuid 
        AND is_active = TRUE
    ) THEN
        RETURN TRUE;
    END IF;
    
    -- Same organization with appropriate role
    IF EXISTS (
        SELECT 1 FROM user_organization_roles uor1
        JOIN user_organization_roles uor2 ON uor1.organization_id = uor2.organization_id
        WHERE uor1.user_id = auth.uid() 
        AND uor2.user_id = learner_uuid
        AND uor1.role IN ('school_admin', 'staff', 'teacher')
        AND uor1.is_active = TRUE 
        AND uor2.is_active = TRUE
    ) THEN
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
