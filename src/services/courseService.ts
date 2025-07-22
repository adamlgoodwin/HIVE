import { supabase, type Course, type UserLayout } from '../lib/supabase'

export class CourseService {
  // COURSE OPERATIONS
  static async getAllCourses(): Promise<Course[]> {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('order_index', { ascending: true })

    if (error) {
      console.error('Error fetching courses:', error)
      throw error
    }

    return data || []
  }

  static async createCourse(course: Omit<Course, 'created_at' | 'updated_at'>): Promise<Course> {
    const { data, error } = await supabase
      .from('courses')
      .insert([course])
      .select()
      .single()

    if (error) {
      console.error('Error creating course:', error)
      throw error
    }

    return data
  }

  static async updateCourse(id: string, updates: Partial<Course>): Promise<Course> {
    const { data, error } = await supabase
      .from('courses')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        console.error(`Course with ID '${id}' not found in database`)
        throw new Error(`Course '${id}' not found. The database may need to be seeded with initial data.`)
      }
      console.error('Error updating course:', error)
      throw error
    }

    return data
  }

  static async deleteCourse(id: string): Promise<void> {
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting course:', error)
      throw error
    }
  }

  static async updateCourseOrder(courses: Course[]): Promise<void> {
    // Update each course individually to only modify order_index
    const updatePromises = courses.map(async (course, index) => {
      const { error } = await supabase
        .from('courses')
        .update({ order_index: index + 1 })
        .eq('id', course.id)
      
      if (error) {
        console.error(`Error updating order for course ${course.id}:`, error)
        throw error
      }
    })

    try {
      await Promise.all(updatePromises)
    } catch (error) {
      console.error('Error updating course order:', error)
      throw error
    }
  }

  // USER LAYOUT OPERATIONS
  static async getUserLayout(userId: string, tableName: string): Promise<UserLayout | null> {
    const { data, error } = await supabase
      .from('user_layouts')
      .select('*')
      .eq('user_id', userId)
      .eq('table_name', tableName)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching user layout:', error)
      throw error
    }

    return data
  }

  static async saveUserLayout(layout: Omit<UserLayout, 'id' | 'created_at' | 'updated_at'>): Promise<UserLayout> {
    const { data, error } = await supabase
      .from('user_layouts')
      .upsert([layout])
      .select()
      .single()

    if (error) {
      console.error('Error saving user layout:', error)
      throw error
    }

    return data
  }

  // REAL-TIME SUBSCRIPTIONS
  static subscribeToCoursesChanges(callback: (payload: any) => void) {
    return supabase
      .channel('courses')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'courses' }, callback)
      .subscribe()
  }

  static subscribeToLayoutChanges(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`user_layouts:${userId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'user_layouts',
          filter: `user_id=eq.${userId}`
        }, 
        callback
      )
      .subscribe()
  }
}
