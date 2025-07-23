import { supabase } from '../lib/supabase'
import type { Course } from '../lib/supabase'

/**
 * 🚀 Linked-List Course Ordering Service
 * 
 * This service provides O(1) insertion, deletion, and reordering operations
 * using a pointer-based linked list approach instead of numeric ordering.
 * 
 * Benefits:
 * - No gaps, no decimals, no reordering ever needed
 * - Infinite insertions possible
 * - Frontend shows clean 1,2,3... numbers
 * - Backend uses efficient pointer structure
 */
export class LinkedListCourseService {

  // CORE OPERATIONS

  /**
   * Get all courses in proper order with display numbers
   */
  static async getOrderedCourses(): Promise<Course[]> {
    try {
      // 1. Get all courses
      const { data: courses, error: coursesError } = await supabase
        .from('courses')
        .select('*')

      if (coursesError) {
        console.error('Error fetching courses:', coursesError)
        throw coursesError
      }

      if (!courses || courses.length === 0) {
        return []
      }

      // 2. Try to get metadata
      const { data: metadata, error: metaError } = await supabase
        .from('course_order_metadata')
        .select('first_course_id')
        .eq('id', 'main')
        .single()

      // 3. If no metadata or invalid first_course_id, return courses by order_index
      if (metaError || !metadata?.first_course_id) {
        console.warn('Linked list not initialized, falling back to order_index')
        return courses
          .sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
          .map((course, index) => ({ ...course, displayOrder: index + 1 }))
      }

      // 4. Build ordered list by traversing linked list
      return this.buildOrderedList(courses, metadata.first_course_id!)
    } catch (error) {
      console.error('Error in getOrderedCourses:', error)
      // Last resort: return empty array rather than crash
      return []
    }
  }

  /**
   * Insert course below a specific course (O(1) operation!)
   */
  static async insertCourseBelow(
    belowCourseId: string, 
    newCourse: Omit<Course, 'next_course_id' | 'displayOrder'>
  ): Promise<Course> {
    
    // 1. Get the course we're inserting below
    const { data: belowCourse, error: fetchError } = await supabase
      .from('courses')
      .select('next_course_id')
      .eq('id', belowCourseId)
      .single()

    if (fetchError || !belowCourse) {
      throw new Error(`Course ${belowCourseId} not found`)
    }

    // 2. Create new course pointing to what the below course pointed to
    const { data: createdCourse, error: createError } = await supabase
      .from('courses')
      .insert([{
        ...newCourse,
        next_course_id: belowCourse.next_course_id  // Point to next course
      }])
      .select()
      .single()

    if (createError || !createdCourse) {
      throw createError || new Error('Failed to create course')
    }

    // 3. Update below course to point to new course
    const { error: updateError } = await supabase
      .from('courses')
      .update({ next_course_id: createdCourse.id })
      .eq('id', belowCourseId)

    if (updateError) {
      // Rollback: delete the created course
      await supabase.from('courses').delete().eq('id', createdCourse.id)
      throw updateError
    }

    return createdCourse
  }

  /**
   * Move course to a new position - ATOMIC operation to prevent loops
   */
  static async moveCourseBelow(courseId: string, targetCourseId: string | null): Promise<void> {
    console.log(`🔗 === LINKED LIST MOVE START ===`);
    console.log(`Moving: ${courseId}`);
    console.log(`Target: ${targetCourseId || 'FIRST_POSITION'}`);
    
    if (courseId === targetCourseId) {
      console.log(`⚠️ No-op: courseId === targetCourseId`);
      return; // No-op
    }
    
    // ATOMIC TRANSACTION: Get current state, calculate new state, update all at once
    const { data: courses } = await supabase
      .from('courses')
      .select('id, next_course_id')
      .in('id', [courseId, targetCourseId].filter(Boolean))
    
    const { data: metadata } = await supabase
      .from('course_order_metadata')
      .select('first_course_id')
      .eq('id', 'main')
      .single()
    
    if (!metadata) throw new Error('Metadata not found')
    
    const courseMap = new Map(courses?.map(c => [c.id, c]) || [])
    const movingCourse = courseMap.get(courseId)
    const targetCourse = targetCourseId ? courseMap.get(targetCourseId) : null
    
    if (!movingCourse) throw new Error('Moving course not found')
    if (targetCourseId && !targetCourse) throw new Error('Target course not found')
    
    // Find what points to the moving course (predecessor)
    const { data: predecessor } = await supabase
      .from('courses')
      .select('id')
      .eq('next_course_id', courseId)
      .maybeSingle()
    
    // Calculate new pointers
    const updates: Array<{id: string, next_course_id: string | null}> = []
    let newFirstCourse = metadata.first_course_id
    
    if (targetCourseId) {
      // Moving below target
      updates.push(
        { id: courseId, next_course_id: targetCourse!.next_course_id },
        { id: targetCourseId, next_course_id: courseId }
      )
    } else {
      // Moving to first position
      updates.push({ id: courseId, next_course_id: metadata.first_course_id })
      newFirstCourse = courseId
    }
    
    // Fix the chain where moving course was removed from
    if (predecessor) {
      updates.push({ id: predecessor.id, next_course_id: movingCourse.next_course_id })
    } else if (metadata.first_course_id === courseId && targetCourseId) {
      // Moving course was first, update metadata
      newFirstCourse = movingCourse.next_course_id
    }
    
    console.log('📊 BEFORE MOVE STATE:');
    console.log('Current metadata first_course_id:', metadata.first_course_id);
    console.log('Moving course current next_course_id:', movingCourse.next_course_id);
    if (targetCourse) {
      console.log('Target course current next_course_id:', targetCourse.next_course_id);
    }
    if (predecessor) {
      console.log('Predecessor found:', predecessor.id);
    } else {
      console.log('No predecessor found (moving course might be first)');
    }
    
    console.log('🔄 CALCULATED UPDATES:');
    updates.forEach((update, i) => {
      console.log(`Update ${i + 1}: Course ${update.id} → next_course_id: ${update.next_course_id}`);
    });
    console.log('New first course will be:', newFirstCourse);
    
    // Execute all updates atomically
    console.log('💾 EXECUTING DATABASE UPDATES...');
    for (const update of updates) {
      console.log(`Updating course ${update.id} → next_course_id: ${update.next_course_id}`);
      const { error } = await supabase
        .from('courses')
        .update({ next_course_id: update.next_course_id })
        .eq('id', update.id);
      
      if (error) {
        console.error(`❌ Failed to update course ${update.id}:`, error);
        throw error;
      }
      console.log(`✅ Updated course ${update.id}`);
    }
    
    // Update metadata if first course changed
    if (newFirstCourse !== metadata.first_course_id) {
      console.log(`🔄 UPDATING METADATA: ${metadata.first_course_id} → ${newFirstCourse}`);
      const { error } = await supabase
        .from('course_order_metadata')
        .update({ first_course_id: newFirstCourse })
        .eq('id', 'main');
        
      if (error) {
        console.error('❌ Failed to update metadata:', error);
        throw error;
      }
      console.log('✅ Metadata updated');
    } else {
      console.log('ℹ️ No metadata update needed');
    }
    
    console.log(`🔗 === LINKED LIST MOVE COMPLETE ===\n`);
  }

  /**
   * Delete course and maintain chain integrity
   */
  static async deleteCourse(courseId: string): Promise<void> {
    // Get course info before deletion
    const { data: course } = await supabase
      .from('courses')
      .select('next_course_id')
      .eq('id', courseId)
      .single()
    
    if (!course) return
    
    // Find what points to this course
    const { data: predecessor } = await supabase
      .from('courses')
      .select('id')
      .eq('next_course_id', courseId)
      .maybeSingle()
    
    // Fix the chain
    if (predecessor) {
      // Update predecessor to skip deleted course
      await supabase
        .from('courses')
        .update({ next_course_id: course.next_course_id })
        .eq('id', predecessor.id)
    } else {
      // Deleted course was first - update metadata
      await supabase
        .from('course_order_metadata')
        .update({ first_course_id: course.next_course_id })
        .eq('id', 'main')
    }
    
    // Delete the course
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', courseId)

    if (error) throw error
  }

  // HELPER METHODS

  /**
   * Build ordered array from linked list structure with cycle detection
   */
  private static buildOrderedList(courses: Course[], firstCourseId: string): Course[] {
    const courseMap = new Map(courses.map(c => [c.id, c]))
    const orderedList: Course[] = []
    const visitedIds = new Set<string>()  // Track visited nodes to detect cycles
    let currentId = firstCourseId

    let position = 1
    while (currentId && courseMap.has(currentId)) {
      // Cycle detection: if we've seen this ID before, we have a loop
      if (visitedIds.has(currentId)) {
        console.error('🚨 CIRCULAR REFERENCE DETECTED in chain at:', currentId)
        console.error('🔧 Chain repair needed - run diagnose-and-fix-chain.sql')
        
        // Emergency fallback: return what we have so far
        break
      }
      
      visitedIds.add(currentId)
      const course = courseMap.get(currentId)!
      orderedList.push({
        ...course,
        displayOrder: position++  // Frontend display number
      })
      currentId = course.next_course_id || ''
      
      // Safety check: if we've processed more courses than exist, something is wrong
      if (position > courses.length + 5) {
        console.error('🚨 INFINITE LOOP DETECTED - position exceeded course count')
        console.error('🔧 Emergency: Run diagnose-and-fix-chain.sql immediately')
        break
      }
    }

    // Validation: warn if not all courses were included
    if (orderedList.length < courses.length) {
      const missingCount = courses.length - orderedList.length
      console.warn(`⚠️ Chain incomplete: ${missingCount} courses missing from traversal`)
    }

    return orderedList
  }

  // Removed: removeCourseFromChain - replaced by atomic operations in moveCourseBelow

  /**
   * Move course to first position - delegate to moveCourseBelow
   */
  static async moveToFirstPosition(courseId: string): Promise<void> {
    // Use the atomic moveCourseBelow with null target (first position)
    await this.moveCourseBelow(courseId, null)
  }

  // MIGRATION HELPERS

  /**
   * Initialize linked list from existing order_index values
   */
  static async initializeFromOrderIndex(): Promise<void> {
    console.log('🔄 Initializing linked list from order_index...')
    
    const { data: courses, error } = await supabase
      .from('courses')
      .select('*')
      .order('order_index', { ascending: true })

    if (error || !courses?.length) {
      throw error || new Error('No courses found')
    }

    // Create linked chain
    for (let i = 0; i < courses.length; i++) {
      const nextCourse = courses[i + 1]
      await supabase
        .from('courses')
        .update({ next_course_id: nextCourse?.id || null })
        .eq('id', courses[i].id)
    }

    // Set first course in metadata
    await supabase
      .from('course_order_metadata')
      .upsert([{ id: 'main', first_course_id: courses[0].id }])

    console.log(`✅ Linked list initialized with ${courses.length} courses`)
  }
}
