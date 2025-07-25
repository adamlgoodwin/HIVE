// Role-Based Access Control Service
// Handles user roles, organizations, and permissions

import { supabase } from '../lib/supabase';
import type { 
  UserProfile, 
  Organization, 
  UserOrganizationRole, 
  ObserverRelationship,
  OrganizationInvitation,
  UserRole,
  RelationshipType,
  UserWithRoles,
  OrganizationWithMembers,
  ObservableStudent,
  RoleCheckResponse,
  AccessCheckResponse
} from '../types/rbac';

export class RBACService {
  
  // =====================================================
  // USER PROFILE MANAGEMENT
  // =====================================================
  
  static async createUserProfile(userData: Partial<UserProfile>): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert(userData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
  
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      console.log('🔍 getUserProfile: Querying for user:', userId);
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      console.log('📊 getUserProfile result:', { data, error });
      
      if (error) {
        console.error('❌ getUserProfile ERROR:', error);
        
        // Check if it's a specific error type
        if (error.code === 'PGRST116') {
          console.log('🎯 User profile not found - this is expected for new users');
          return null;
        }
        
        if (error.code === '42501') {
          console.log('🔒 RLS Policy blocking query - check database policies');
        }
        
        throw error;
      }
      
      console.log('✅ getUserProfile FOUND:', data?.email);
      return data;
      
    } catch (error) {
      console.error('💥 getUserProfile FAILED:', error);
      throw error;
    }
  }
  
  static async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
  
  static async getUserWithRoles(userId: string): Promise<UserWithRoles | null> {
    try {
      console.log('📋 Step 1: Getting user profile for:', userId);
      console.log('🔍 User ID type:', typeof userId);
      console.log('🔍 User ID value:', JSON.stringify(userId));
      
      const profile = await this.getUserProfile(userId);
      if (!profile) {
        console.error('❌ No user profile found for:', userId);
        return null;
      }
      
      console.log('✅ User profile found:', profile.email);
      
      console.log('📋 Step 2: Getting organization roles...');
      
      // Get organization roles
      const { data: roleData, error: roleError } = await supabase
        .from('user_organization_roles')
        .select(`
          role,
          is_active,
          joined_at,
          organization:organizations(*)
        `)
        .eq('user_id', userId)
        .eq('is_active', true);
      
      if (roleError) {
        console.error('❌ Role query error:', roleError);
        throw roleError;
      }
      
      console.log('✅ Organization roles found:', roleData?.length || 0, 'roles');
      
      console.log('📋 Step 3: Getting observer relationships...');
      
      // Get observer relationships
      const { data: observerData, error: observerError } = await supabase
        .from('observer_relationships')
        .select(`
          *,
          learner:user_profiles!learner_id(*),
          organization:organizations(*)
        `)
        .eq('observer_id', userId)
        .eq('is_active', true);
      
      if (observerError) {
        console.error('❌ Observer query error:', observerError);
        throw observerError;
      }
      
      console.log('✅ Observer relationships found:', observerData?.length || 0, 'relationships');
      
      const result = {
        profile,
        organizations: roleData?.map(r => ({
          organization: r.organization as any,
          role: r.role as any,
          is_active: r.is_active as boolean,
          joined_at: r.joined_at as string
        })) || [],
        observer_relationships: observerData || []
      };
      
      console.log('🎉 Final result:', result);
      return result;
      
    } catch (error) {
      console.error('💥 getUserWithRoles failed:', error);
      throw error;
    }
  }
  
  // =====================================================
  // ORGANIZATION MANAGEMENT
  // =====================================================
  
  static async createOrganization(orgData: Partial<Organization>): Promise<Organization> {
    const { data, error } = await supabase
      .from('organizations')
      .insert(orgData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
  
  static async getOrganization(orgId: string): Promise<Organization | null> {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', orgId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }
  
  static async getUserOrganizations(userId: string): Promise<Organization[]> {
    const { data, error } = await supabase
      .from('user_organization_roles')
      .select('organization:organizations(*)')
      .eq('user_id', userId)
      .eq('is_active', true);
    
    if (error) throw error;
    return data?.map(r => r.organization as any) || [];
  }
  
  static async getOrganizationWithMembers(orgId: string): Promise<OrganizationWithMembers | null> {
    // Get organization
    const organization = await this.getOrganization(orgId);
    if (!organization) return null;
    
    // Get members
    const { data: memberData, error: memberError } = await supabase
      .from('user_organization_roles')
      .select(`
        role,
        is_active,
        joined_at,
        user:user_profiles(*)
      `)
      .eq('organization_id', orgId)
      .eq('is_active', true);
    
    if (memberError) throw memberError;
    
    // Get pending invitations
    const { data: invitationData, error: invitationError } = await supabase
      .from('organization_invitations')
      .select(`
        *,
        inviter:user_profiles!invited_by(*)
      `)
      .eq('organization_id', orgId)
      .is('accepted_at', null)
      .gt('expires_at', new Date().toISOString());
    
    if (invitationError) throw invitationError;
    
    return {
      organization,
      members: memberData?.map(m => ({
        user: m.user as any,
        role: m.role as any,
        is_active: m.is_active as boolean,
        joined_at: m.joined_at as string
      })) || [],
      pending_invitations: invitationData || []
    };
  }
  
  // =====================================================
  // ROLE MANAGEMENT
  // =====================================================
  
  static async assignRole(
    userId: string, 
    organizationId: string, 
    role: UserRole,
    invitedBy?: string
  ): Promise<UserOrganizationRole> {
    const { data, error } = await supabase
      .from('user_organization_roles')
      .insert({
        user_id: userId,
        organization_id: organizationId,
        role,
        invited_by: invitedBy
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
  
  static async updateRole(
    userId: string,
    organizationId: string,
    newRole: UserRole
  ): Promise<UserOrganizationRole> {
    const { data, error } = await supabase
      .from('user_organization_roles')
      .update({ role: newRole })
      .eq('user_id', userId)
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
  
  static async removeRole(userId: string, organizationId: string): Promise<void> {
    const { error } = await supabase
      .from('user_organization_roles')
      .update({ 
        is_active: false, 
        left_at: new Date().toISOString() 
      })
      .eq('user_id', userId)
      .eq('organization_id', organizationId);
    
    if (error) throw error;
  }
  
  static async checkUserRole(
    userId: string, 
    organizationId: string, 
    requiredRole?: UserRole
  ): Promise<RoleCheckResponse> {
    const { data, error } = await supabase
      .from('user_organization_roles')
      .select(`
        role,
        organization:organizations(*)
      `)
      .eq('user_id', userId)
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    
    const has_role = data ? (requiredRole ? data.role === requiredRole : true) : false;
    
    return {
      has_role,
      role: data?.role,
      organization: data?.organization as any
    };
  }
  
  // =====================================================
  // OBSERVER RELATIONSHIPS
  // =====================================================
  
  static async createObserverRelationship(
    observerId: string,
    learnerId: string,
    organizationId?: string,
    relationshipType: RelationshipType = 'guardian'
  ): Promise<ObserverRelationship> {
    const { data, error } = await supabase
      .from('observer_relationships')
      .insert({
        observer_id: observerId,
        learner_id: learnerId,
        organization_id: organizationId,
        relationship_type: relationshipType
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
  
  static async getObservableStudents(observerId: string): Promise<ObservableStudent[]> {
    const { data, error } = await supabase
      .rpc('get_observable_learners', { observer_uuid: observerId });
    
    if (error) throw error;
    return data || [];
  }
  
  static async removeObserverRelationship(relationshipId: string): Promise<void> {
    const { error } = await supabase
      .from('observer_relationships')
      .update({ is_active: false })
      .eq('id', relationshipId);
    
    if (error) throw error;
  }
  
  // =====================================================
  // INVITATIONS
  // =====================================================
  
  static async createInvitation(
    organizationId: string,
    email: string,
    role: UserRole,
    invitedBy: string,
    expiresInDays: number = 7
  ): Promise<OrganizationInvitation> {
    const invitation_token = crypto.randomUUID();
    const expires_at = new Date(Date.now() + (expiresInDays * 24 * 60 * 60 * 1000)).toISOString();
    
    const { data, error } = await supabase
      .from('organization_invitations')
      .insert({
        organization_id: organizationId,
        email,
        role,
        invited_by: invitedBy,
        invitation_token,
        expires_at
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
  
  static async acceptInvitation(token: string, userId: string): Promise<UserOrganizationRole> {
    // Get invitation
    const { data: invitation, error: inviteError } = await supabase
      .from('organization_invitations')
      .select('*')
      .eq('invitation_token', token)
      .is('accepted_at', null)
      .gt('expires_at', new Date().toISOString())
      .single();
    
    if (inviteError) throw inviteError;
    if (!invitation) throw new Error('Invalid or expired invitation');
    
    // Accept invitation
    const { error: acceptError } = await supabase
      .from('organization_invitations')
      .update({ 
        accepted_at: new Date().toISOString(),
        accepted_by: userId 
      })
      .eq('id', invitation.id);
    
    if (acceptError) throw acceptError;
    
    // Assign role
    return await this.assignRole(
      userId,
      invitation.organization_id,
      invitation.role,
      invitation.invited_by
    );
  }
  
  // =====================================================
  // AUTHORIZATION HELPERS
  // =====================================================
  
  static async canAccessLearner(userId: string, learnerId: string): Promise<AccessCheckResponse> {
    const { data, error } = await supabase
      .rpc('can_access_learner', { learner_uuid: learnerId });
    
    if (error) throw error;
    
    return {
      can_access: data === true,
      access_type: userId === learnerId ? 'self' : 'organization_role'
    };
  }
  
  static async isPlatformAdmin(_userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .rpc('is_platform_admin');
    
    if (error) throw error;
    return data === true;
  }
  
  static async hasOrgRole(organizationId: string, requiredRole: UserRole): Promise<boolean> {
    const { data, error } = await supabase
      .rpc('has_org_role', { org_id: organizationId, required_role: requiredRole });
    
    if (error) throw error;
    return data === true;
  }
}
