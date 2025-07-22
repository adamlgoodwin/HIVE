-- Flexible Role-Based Access Control System for Educational SaaS
-- Supports multi-tenancy, dynamic role assignments, and cross-organization relationships

-- Enable RLS on all tables
SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = on;

-- Create custom types for roles and organization types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM (
        'platform_admin',    -- SaaS platform administrator
        'school_admin',      -- Organization/school administrator  
        'staff',            -- School staff member
        'teacher',          -- Teacher/instructor
        'learner',          -- Student/learner
        'observer'          -- Parent/guardian/observer
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE organization_type AS ENUM (
        'school',           -- Traditional school
        'program',          -- Educational program
        'course_provider',  -- Online course provider
        'district',         -- School district
        'institution'       -- Higher education institution
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Extended user profiles (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    display_name VARCHAR(200),
    avatar_url TEXT,
    timezone VARCHAR(50) DEFAULT 'UTC',
    is_platform_admin BOOLEAN DEFAULT FALSE,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Organizations (schools, programs, institutions)
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL, -- URL-friendly identifier
    description TEXT,
    org_type organization_type NOT NULL DEFAULT 'school',
    domain VARCHAR(255), -- Email domain for auto-joining
    logo_url TEXT,
    website VARCHAR(255),
    address JSONB, -- Flexible address storage
    settings JSONB DEFAULT '{}', -- Organization-specific settings
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User-Organization-Role relationships (many-to-many with role context)
CREATE TABLE IF NOT EXISTS user_organization_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    role user_role NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    left_at TIMESTAMP WITH TIME ZONE,
    invited_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one active role per user per organization
    UNIQUE(user_id, organization_id, role) DEFERRABLE INITIALLY DEFERRED
);

-- Observer-Learner relationships (flexible cross-organization monitoring)
CREATE TABLE IF NOT EXISTS observer_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    observer_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    learner_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    relationship_type VARCHAR(50) DEFAULT 'guardian', -- parent, guardian, tutor, mentor
    can_view_grades BOOLEAN DEFAULT TRUE,
    can_view_attendance BOOLEAN DEFAULT TRUE,
    can_view_progress BOOLEAN DEFAULT TRUE,
    can_receive_notifications BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE, -- Optional expiration
    
    -- Prevent self-observation and ensure unique active relationships
    CHECK (observer_id != learner_id),
    UNIQUE(observer_id, learner_id, organization_id)
);

-- Invitations system for joining organizations
CREATE TABLE IF NOT EXISTS organization_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    invited_by UUID NOT NULL REFERENCES user_profiles(id),
    invitation_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    accepted_at TIMESTAMP WITH TIME ZONE,
    accepted_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    
    -- Note: Partial unique constraint created below with index
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organizations_domain ON organizations(domain);
CREATE INDEX IF NOT EXISTS idx_user_org_roles_user ON user_organization_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_org_roles_org ON user_organization_roles(organization_id);
CREATE INDEX IF NOT EXISTS idx_user_org_roles_active ON user_organization_roles(user_id, organization_id) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_observer_relationships_observer ON observer_relationships(observer_id);
CREATE INDEX IF NOT EXISTS idx_observer_relationships_learner ON observer_relationships(learner_id);
CREATE INDEX IF NOT EXISTS idx_invitations_token ON organization_invitations(invitation_token);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON organization_invitations(email);

-- Partial unique constraint: Prevent duplicate pending invitations
CREATE UNIQUE INDEX IF NOT EXISTS idx_invitations_unique_pending 
    ON organization_invitations(organization_id, email, role) 
    WHERE accepted_at IS NULL;

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to get user's roles across all organizations
CREATE OR REPLACE FUNCTION get_user_roles(user_uuid UUID)
RETURNS TABLE (
    organization_id UUID,
    organization_name VARCHAR,
    role user_role,
    is_active BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        uor.organization_id,
        o.name,
        uor.role,
        uor.is_active
    FROM user_organization_roles uor
    JOIN organizations o ON o.id = uor.organization_id
    WHERE uor.user_id = user_uuid
    ORDER BY o.name, uor.role;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user has specific role in organization
CREATE OR REPLACE FUNCTION user_has_role(user_uuid UUID, org_uuid UUID, required_role user_role)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_organization_roles 
        WHERE user_id = user_uuid 
        AND organization_id = org_uuid 
        AND role = required_role 
        AND is_active = TRUE
    );
END;
$$ LANGUAGE plpgsql;

-- Function to get learners that an observer can monitor
CREATE OR REPLACE FUNCTION get_observable_learners(observer_uuid UUID)
RETURNS TABLE (
    learner_id UUID,
    learner_name VARCHAR,
    organization_id UUID,
    organization_name VARCHAR,
    relationship_type VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        or_.learner_id,
        COALESCE(up.display_name, up.first_name || ' ' || up.last_name) as learner_name,
        or_.organization_id,
        o.name as organization_name,
        or_.relationship_type
    FROM observer_relationships or_
    JOIN user_profiles up ON up.id = or_.learner_id
    LEFT JOIN organizations o ON o.id = or_.organization_id
    WHERE or_.observer_id = observer_uuid 
    AND or_.is_active = TRUE
    ORDER BY learner_name;
END;
$$ LANGUAGE plpgsql;
