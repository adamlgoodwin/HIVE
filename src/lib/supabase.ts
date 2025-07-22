import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Course {
  id: string
  title: string
  instructor: string
  order_index?: number
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
