import { createClient } from '@supabase/supabase-js'

// Debug environment variables
console.log('🔍 Environment variables:');
console.log('SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('SUPABASE_ANON_KEY exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Test Supabase connection
export async function testSupabaseConnection() {
  try {
    console.log('🧪 Testing Supabase connection...');
    console.log('URL:', supabaseUrl);
    
    // Test basic connection
    const { data, error } = await supabase.auth.getSession();
    console.log('✅ Auth test:', { data, error });
    
    // Test database query
    const { data: testData, error: testError } = await supabase
      .from('user_profiles')
      .select('id')
      .limit(1);
    
    console.log('✅ Database test:', { testData, testError });
    
    return { success: !error && !testError, auth: data, db: testData };
  } catch (error) {
    console.error('❌ Connection test failed:', error);
    return { success: false, error };
  }
}

// Database types
export interface Course {
  id: string
  title: string
  instructor: string
  order_index?: number // Legacy field - will be deprecated
  next_course_id?: string | null // Linked list pointer
  displayOrder?: number // Frontend-only field for showing 1,2,3...
  created_at?: string
  updated_at?: string
}

export interface CourseOrderMetadata {
  id: string
  first_course_id: string | null
  created_at?: string
  updated_at?: string
}

export interface UserLayout {
  id: string
  user_id: string
  table_name: string
  column_order: string[]
  column_visibility: Record<string, boolean>
  row_order: string[]
  filter_preferences: Record<string, any>
  sort_preferences: Record<string, any>
  created_at?: string
  updated_at?: string
}
