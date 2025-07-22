// Role-Based Access Control Types for Educational SaaS

// =====================================================
// ENUMS & BASIC TYPES
// =====================================================

export type UserRole = 
  | 'platform_admin'    // SaaS platform administrator
  | 'school_admin'      // Organization/school administrator  
  | 'staff'            // School staff member
  | 'teacher'          // Teacher/instructor
  | 'learner'          // Student/learner
  | 'observer';        // Parent/guardian/observer

export type OrganizationType = 
  | 'school'           // Traditional school
  | 'program'          // Educational program
  | 'course_provider'  // Online course provider
  | 'district'         // School district
  | 'institution';     // Higher education institution

export type RelationshipType = 
  | 'parent' 
  | 'guardian' 
  | 'tutor' 
  | 'mentor'
  | 'counselor'
  | 'family_friend';

// =====================================================
// CORE INTERFACES
// =====================================================

export interface UserProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  display_name?: string;
  avatar_url?: string;
  timezone: string;
  is_platform_admin: boolean;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  org_type: OrganizationType;
  domain?: string;
  logo_url?: string;
  website?: string;
  address?: Record<string, any>;
  settings: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserOrganizationRole {
  id: string;
  user_id: string;
  organization_id: string;
  role: UserRole;
  is_active: boolean;
  joined_at: string;
  left_at?: string;
  invited_by?: string;
  created_at: string;
  
  // Populated relations
  user?: UserProfile;
  organization?: Organization;
}

export interface ObserverRelationship {
  id: string;
  observer_id: string;
  learner_id: string;
  organization_id?: string;
  relationship_type: RelationshipType;
  can_view_grades: boolean;
  can_view_attendance: boolean;
  can_view_progress: boolean;
  can_receive_notifications: boolean;
  is_active: boolean;
  created_at: string;
  expires_at?: string;
  
  // Populated relations
  observer?: UserProfile;
  learner?: UserProfile;
  organization?: Organization;
}

export interface OrganizationInvitation {
  id: string;
  organization_id: string;
  email: string;
  role: UserRole;
  invited_by: string;
  invitation_token: string;
  expires_at: string;
  accepted_at?: string;
  accepted_by?: string;
  created_at: string;
  
  // Populated relations
  organization?: Organization;
  inviter?: UserProfile;
  accepter?: UserProfile;
}

// =====================================================
// COMPOSITE TYPES FOR UI
// =====================================================

export interface UserWithRoles {
  profile: UserProfile;
  organizations: Array<{
    organization: Organization;
    role: UserRole;
    is_active: boolean;
    joined_at: string;
  }>;
  observer_relationships: ObserverRelationship[];
}

export interface OrganizationWithMembers {
  organization: Organization;
  members: Array<{
    user: UserProfile;
    role: UserRole;
    is_active: boolean;
    joined_at: string;
  }>;
  pending_invitations: OrganizationInvitation[];
}

export interface ObservableStudent {
  learner_id: string;
  learner_name: string;
  organization_id?: string;
  organization_name?: string;
  relationship_type: RelationshipType;
  permissions: {
    can_view_grades: boolean;
    can_view_attendance: boolean;
    can_view_progress: boolean;
    can_receive_notifications: boolean;
  };
}

// =====================================================
// PERMISSION CHECKING TYPES
// =====================================================

export interface PermissionContext {
  user_id: string;
  organization_id?: string;
  target_user_id?: string;
  required_role?: UserRole;
  action?: string;
}

export interface AuthorizationResult {
  allowed: boolean;
  reason?: string;
  context?: Record<string, any>;
}

// =====================================================
// API RESPONSE TYPES
// =====================================================

export interface RoleCheckResponse {
  has_role: boolean;
  role?: UserRole;
  organization?: Organization;
}

export interface AccessCheckResponse {
  can_access: boolean;
  access_type?: 'self' | 'observer' | 'organization_role' | 'platform_admin';
  permissions?: string[];
}

// =====================================================
// UTILITY TYPES
// =====================================================

export type RoleLevel = 'platform' | 'organization' | 'cross_organization';

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  platform_admin: 100,
  school_admin: 80,
  staff: 60,
  teacher: 40,
  learner: 20,
  observer: 10,
} as const;

export const ORGANIZATION_ROLES: UserRole[] = [
  'school_admin',
  'staff', 
  'teacher', 
  'learner'
] as const;

export const ADMIN_ROLES: UserRole[] = [
  'platform_admin',
  'school_admin',
  'staff'
] as const;

// =====================================================
// TYPE GUARDS
// =====================================================

export const isAdminRole = (role: UserRole): boolean => {
  return ADMIN_ROLES.includes(role);
};

export const isOrganizationRole = (role: UserRole): boolean => {
  return ORGANIZATION_ROLES.includes(role);
};

export const canManageRole = (userRole: UserRole, targetRole: UserRole): boolean => {
  return ROLE_HIERARCHY[userRole] > ROLE_HIERARCHY[targetRole];
};

export const isPlatformAdmin = (user: UserProfile | null): boolean => {
  return user?.is_platform_admin === true;
};
