import { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { RBACService } from '../services/rbacService';

// Types
interface Organization {
  id: string;
  name: string;
  slug: string;
  org_type: string;
}

interface UserWithRoles {
  profile: any;
  organizations: Array<{
    organization: Organization;
    role: string;
    is_active: boolean;
    joined_at: string;
  }>;
  observer_relationships: any[];
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  userWithRoles: UserWithRoles | null;
  activeOrg: Organization | null;
  setActiveOrg: (org: Organization | null) => void;
  signOut: () => Promise<void>;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userWithRoles, setUserWithRoles] = useState<UserWithRoles | null>(null);
  const [activeOrg, setActiveOrg] = useState<Organization | null>(null);
  const loadingRoles = useRef(false);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await loadUserRoles(session.user.id);
      }
      
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await loadUserRoles(session.user.id);
        } else {
          setUserWithRoles(null);
          setActiveOrg(null);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadUserRoles = async (userId: string) => {
    // Prevent multiple concurrent calls
    if (loadingRoles.current) return;
    loadingRoles.current = true;
    
    try {
      console.log('🔍 Loading user roles for:', userId);
      
      const userRoles = await RBACService.getUserWithRoles(userId);
      
      if (!userRoles) {
        console.error('❌ No user roles returned from RBACService');
        throw new Error('No user roles found');
      }
      
      console.log('✅ User roles loaded successfully:', userRoles);
      setUserWithRoles(userRoles);
      
      // Set first organization as active if none selected
      if (userRoles.organizations && userRoles.organizations.length > 0 && !activeOrg) {
        const firstOrg = userRoles.organizations[0];
        if (firstOrg?.organization) {
          console.log('🏢 Setting active organization:', firstOrg.organization.name);
          setActiveOrg(firstOrg.organization);
        }
      } else if (userRoles.organizations?.length === 0) {
        console.warn('⚠️ User has no organizations assigned');
      }
    } catch (error) {
      console.error('❌ Failed to load user roles:', error);
      throw error; // Don't hide the error - we need to fix this
    } finally {
      setLoading(false);
      loadingRoles.current = false;
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUserWithRoles(null);
    setActiveOrg(null);
  };

  const value = {
    session,
    user,
    loading,
    userWithRoles,
    activeOrg,
    setActiveOrg,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
