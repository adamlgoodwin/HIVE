import { useState, useEffect } from 'react';
import { MantineReactTable, type MRT_ColumnDef, useMantineReactTable, type MRT_ColumnOrderState, type MRT_VisibilityState } from 'mantine-react-table';
import { Box, Button, Flex, Alert } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { CourseService } from '../services/courseService';
import { type Course } from '../lib/supabase';

export function DatabaseTable() {
  const [data, setData] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [columnOrder, setColumnOrder] = useState<MRT_ColumnOrderState>([]);
  const [columnVisibility, setColumnVisibility] = useState<MRT_VisibilityState>({});

  // Load initial data
  useEffect(() => {
    loadCourses();
    setupRealtimeSubscription();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const courses = await CourseService.getAllCourses();
      
      // If database is empty, seed with initial data
      if (courses.length === 0) {
        console.log('Database is empty, seeding with initial data...');
        await seedInitialData();
        const seededCourses = await CourseService.getAllCourses();
        setData(seededCourses);
      } else {
        setData(courses);
      }
      
      setError(null);
    } catch (err) {
      console.error('Failed to load courses:', err);
      setError('Failed to load courses from database');
    } finally {
      setLoading(false);
    }
  };

  const seedInitialData = async () => {
    const initialCourses = [
      { id: 'PHYS101', title: 'Physics', instructor: 'Dr. Smith' },
      { id: 'CALC201', title: 'Calculus II', instructor: 'Prof. Johnson' },
      { id: 'HIST301', title: 'History of Rome', instructor: 'Dr. Davis' },
    ];
    
    for (const course of initialCourses) {
      await CourseService.createCourse(course);
    }
  };

  const setupRealtimeSubscription = () => {
    const subscription = CourseService.subscribeToCoursesChanges((payload) => {
      console.log('Real-time update:', payload);
      // Reload data when changes occur
      loadCourses();
    });

    return () => {
      subscription.unsubscribe();
    };
  };

  const handleSaveCourse = async ({ row, values, exitEditingMode }: any) => {
    try {
      // Get the id from the original row data, use form values for updates
      const courseId = row.original.id;
      await CourseService.updateCourse(courseId, values);
      exitEditingMode(); // Exit edit mode on successful save
      // Data will be updated via real-time subscription
    } catch (err) {
      console.error('Failed to save course:', err);
      setError('Failed to save course');
    }
  };

  const handleAddCourse = async () => {
    try {
      const newCourse: Course = {
        id: `NEW${Date.now()}`,
        title: 'New Course',
        instructor: 'New Instructor',
        order_index: data.length + 1,
      };
      await CourseService.createCourse(newCourse);
      // Data will be updated via real-time subscription
    } catch (err) {
      console.error('Failed to add course:', err);
      setError('Failed to add course');
    }
  };

  const handleRowOrderChange = async (newData: Course[]) => {
    try {
      setData(newData);
      await CourseService.updateCourseOrder(newData);
    } catch (err) {
      console.error('Failed to update order:', err);
      setError('Failed to update order');
      // Reload data to restore correct order
      loadCourses();
    }
  };

  const columns: MRT_ColumnDef<Course>[] = [
    {
      accessorKey: 'id',
      header: 'Course ID',
      size: 120,
    },
    {
      accessorKey: 'title',
      header: 'Course Title',
      size: 300,
    },
    {
      accessorKey: 'instructor',
      header: 'Instructor',
      size: 200,
    },
    {
      accessorKey: 'order_index',
      header: 'Order',
      size: 80,
      enableEditing: false,
    },
  ];

  const table = useMantineReactTable({
    columns,
    data,
    state: {
      isLoading: loading,
      columnOrder,
      columnVisibility,
    },
    // Row ordering (drag and drop rows)
    enableRowOrdering: true,
    enableSorting: false,
    mantineRowDragHandleProps: () => ({
      onDragEnd: () => {
        const { draggingRow, hoveredRow } = table.getState();
        if (hoveredRow && draggingRow && typeof draggingRow.index === 'number' && typeof hoveredRow.index === 'number') {
          const newData = [...data];
          const draggedItem = newData[draggingRow.index];
          if (draggedItem) {
            newData.splice(draggingRow.index, 1);
            newData.splice(hoveredRow.index, 0, draggedItem);
            handleRowOrderChange(newData);
          }
        }
      },
    }),
    // Column ordering (drag and drop columns)
    enableColumnOrdering: true,
    onColumnOrderChange: setColumnOrder,
    onColumnVisibilityChange: setColumnVisibility,
    // Editing functionality
    enableEditing: true,
    editDisplayMode: 'row',
    onEditingRowSave: handleSaveCourse,
    // Search and filtering
    enableColumnFilters: true,
    enableGlobalFilter: true,
    enableColumnFilterModes: true,
    initialState: {
      showColumnFilters: true,
      showGlobalFilter: true,
    },
    mantineTableProps: {
      style: {
        border: '1px solid #e0e0e0',
      },
    },
    mantineTableHeadProps: {
      style: {
        backgroundColor: '#f8f9fa',
      },
    },
    mantineTableBodyRowProps: () => ({
      style: {
        cursor: 'grab',
        '&:hover': {
          backgroundColor: '#f1f3f4',
        },
      },
    }),
    // Add action buttons for editing
    renderRowActions: ({ row }) => (
      <Flex gap="sm">
        <Button
          size="xs"
          onClick={() => table.setEditingRow(row)}
          variant="light"
        >
          Edit
        </Button>
      </Flex>
    ),
    renderTopToolbarCustomActions: () => (
      <Button onClick={handleAddCourse} variant="filled">
        Add Course
      </Button>
    ),
  });

  if (error) {
    return (
      <Alert icon={<IconInfoCircle size="1rem" />} title="Database Error" color="red">
        {error}
        <Button size="xs" onClick={loadCourses} mt="sm">
          Retry
        </Button>
      </Alert>
    );
  }

  return (
    <Box>
      <MantineReactTable table={table} />
    </Box>
  );
}
