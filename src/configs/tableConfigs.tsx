// Import type for columns
import type { GenericTableConfig } from '../interfaces/genericTable';
import type { Course } from '../lib/supabase';
import { CourseDataService, CourseOrderingService } from '../services/courseDataService';
import { Button, Badge, Group } from '@mantine/core';
import { IconStar, IconBookmarks } from '@tabler/icons-react';

// ===== COURSE TABLE CONFIGURATIONS =====

// Original full-featured course table
export const courseTableConfig: GenericTableConfig<Course> = {
  columns: [
    {
      accessorKey: 'id',
      header: 'Course ID',
      size: 120,
      enableEditing: false,
    },
    {
      accessorKey: 'title',
      header: 'Course Title',
      size: 300,
      enableEditing: true,
    },
    {
      accessorKey: 'instructor',
      header: 'Instructor',
      size: 200,
      enableEditing: true,
    },
    {
      accessorKey: 'order_index',
      header: 'Order',
      size: 80,
      enableEditing: false,
    },
  ],
  dataService: new CourseDataService(),
  orderingService: new CourseOrderingService(),
  entityName: 'course',
  tableTitle: 'Course Management System',
  addButtonText: 'Add New Course',
  seedInitialData: async () => {
    console.log('Seeding initial course data...');
  },
  features: {
    editing: true,
    adding: true,
    deleting: true,
    bulkOperations: true,
    clipboard: true,
    ordering: true,
    columnOrdering: true,
    columnVisibility: true,
    filtering: true,
    globalSearch: true,
    realtime: true,
  }
};

// Simplified read-only course catalog
export const courseCatalogConfig: GenericTableConfig<Course> = {
  columns: [
    {
      accessorKey: 'title',
      header: 'Course Name',
      size: 400,
      enableEditing: false,
      Cell: ({ cell }) => (
        <Group gap="sm">
          <IconBookmarks size={16} color="blue" />
          <strong>{cell.getValue() as string}</strong>
        </Group>
      ),
    },
    {
      accessorKey: 'instructor',
      header: 'Taught By',
      size: 200,
      enableEditing: false,
      Cell: ({ cell }) => (
        <Badge variant="light" color="green">
          {cell.getValue() as string}
        </Badge>
      ),
    },
  ],
  dataService: new CourseDataService(),
  entityName: 'course',
  tableTitle: 'Course Catalog (Read-Only)',
  emptyStateText: 'No courses available in catalog',
  features: {
    editing: false,
    adding: false,
    deleting: false,
    bulkOperations: false,
    clipboard: false,
    ordering: false,
    columnOrdering: false,
    columnVisibility: false,
    filtering: true,
    globalSearch: true,
    realtime: true,
  },
  styling: {
    tableProps: {
      style: { border: '2px solid #4CAF50' }
    },
    headProps: {
      style: { backgroundColor: '#E8F5E8' }
    }
  }
};

// Compact course picker with custom actions
export const coursePickerConfig: GenericTableConfig<Course> = {
  columns: [
    {
      accessorKey: 'title',
      header: 'Select Course',
      size: 300,
      enableEditing: false,
    },
    {
      accessorKey: 'instructor',
      header: 'Instructor',
      size: 150,
      enableEditing: false,
    },
  ],
  dataService: new CourseDataService(),
  entityName: 'course',
  tableTitle: 'Course Selection',
  features: {
    editing: false,
    adding: false,
    deleting: false,
    bulkOperations: true, // Allow multi-select
    clipboard: false,
    ordering: false,
    columnOrdering: false,
    columnVisibility: false,
    filtering: false,
    globalSearch: true,
    realtime: false,
  },
  customActions: {
    toolbarActions: ({ selectedRows }: any) => (
      <Group gap="sm">
        {selectedRows.length > 0 && (
          <>
            <Button 
              variant="filled" 
              color="blue"
              leftSection={<IconStar size={16} />}
            >
              Add {selectedRows.length} to Favorites
            </Button>
            <Button 
              variant="light" 
              color="green"
            >
              Enroll in {selectedRows.length} Course{selectedRows.length > 1 ? 's' : ''}
            </Button>
          </>
        )}
      </Group>
    ),
    rowActions: ({ row }: any) => (
      <Button 
        size="xs" 
        variant="light"
        onClick={() => alert(`Quick enroll in ${row.original.title}!`)}
      >
        Quick Enroll
      </Button>
    )
  },
  styling: {
    tableProps: {
      style: { border: '1px solid #2196F3', borderRadius: '8px' }
    }
  }
};

// Ultra-minimal course list  
export const simpleCourseListConfig: GenericTableConfig<Course> = {
  columns: [
    {
      accessorKey: 'title',
      header: 'Course',
      enableEditing: false,
    },
  ],
  dataService: new CourseDataService(),
  entityName: 'course',
  tableTitle: 'Simple Course List',
  features: {
    editing: false,
    adding: false,
    deleting: false,
    bulkOperations: false,
    clipboard: false,
    ordering: false,
    columnOrdering: false,
    columnVisibility: false,
    filtering: false,
    globalSearch: false,
    realtime: false,
  },
  styling: {
    tableProps: {
      style: { border: 'none', backgroundColor: '#FAFAFA' }
    },
    headProps: {
      style: { display: 'none' } // Hide header completely
    }
  }
};
