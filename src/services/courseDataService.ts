import type { IDataService, IOrderingService } from '../interfaces/genericTable';
import type { Course } from '../lib/supabase';
import { CourseService } from './courseService';
import { LinkedListCourseService } from './linkedListCourseService';

// Adapter for Course data service
export class CourseDataService implements IDataService<Course> {
  async getAllItems(): Promise<Course[]> {
    return CourseService.getAllCourses();
  }

  async createItem(item: Omit<Course, 'created_at' | 'updated_at'>): Promise<Course> {
    return CourseService.createCourse(item);
  }

  async updateItem(id: string, updates: Partial<Course>): Promise<Course> {
    return CourseService.updateCourse(id, updates);
  }

  async deleteItem(id: string): Promise<void> {
    return CourseService.deleteCourse(id);
  }

  subscribeToChanges(callback: (payload: any) => void) {
    return CourseService.subscribeToCoursesChanges(callback);
  }
}

// Adapter: Makes LinkedListCourseService compatible with generic interface
export class CourseOrderingService implements IOrderingService<Course> {
  async getOrderedItems(): Promise<Course[]> {
    return LinkedListCourseService.getOrderedCourses();
  }

  async insertBelow(belowId: string, newItem: Omit<Course, 'next_course_id' | 'displayOrder'>): Promise<Course> {
    return LinkedListCourseService.insertCourseBelow(belowId, newItem);
  }

  async moveBelow(courseId: string, targetId: string | null): Promise<void> {
    return LinkedListCourseService.moveCourseBelow(courseId, targetId);
  }

  async initializeFromIndex(): Promise<void> {
    return LinkedListCourseService.initializeFromOrderIndex();
  }
}
