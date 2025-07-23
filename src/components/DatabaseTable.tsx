import { useState, useEffect } from 'react';
import { MantineReactTable, type MRT_ColumnDef, useMantineReactTable, type MRT_ColumnOrderState, type MRT_VisibilityState } from 'mantine-react-table';
import { Box, Button, Flex, Alert, Menu } from '@mantine/core';
import { IconInfoCircle, IconPlus, IconEdit, IconTrash } from '@tabler/icons-react';
import { CourseService } from '../services/courseService';
import { LinkedListCourseService } from '../services/linkedListCourseService';
import { type Course } from '../lib/supabase';

export function DatabaseTable() {
  const [data, setData] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [clipboard, setClipboard] = useState<{action: 'cut' | 'copy', courses: Course[]} | null>(null);
  const [columnOrder, setColumnOrder] = useState<MRT_ColumnOrderState>([]);
  const [columnVisibility, setColumnVisibility] = useState<MRT_VisibilityState>({});

  // Load initial data
  useEffect(() => {
    loadCourses();
    setupRealtimeSubscription();
  }, []);

  // Keyboard shortcuts for cut/copy
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle shortcuts when not editing
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') {
        return;
      }

      if ((e.ctrlKey || e.metaKey)) {
        const selectedRows = Object.keys(rowSelection).filter(key => rowSelection[key]);
        const selectedCourses = selectedRows.map(id => data.find(course => course.id === id)).filter(Boolean) as Course[];
        
        if (e.key === 'x' && selectedCourses.length > 0) {
          e.preventDefault();
          handleCutCourses(selectedCourses);
        } else if (e.key === 'c' && selectedCourses.length > 0) {
          e.preventDefault();
          handleCopyCourses(selectedCourses);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [rowSelection, data]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      // Try to get ordered courses from linked list first
      let courses = await LinkedListCourseService.getOrderedCourses();
      
      // If empty or not properly linked, fallback to initialize from order_index
      if (courses.length === 0) {
        const fallbackCourses = await CourseService.getAllCourses();
        if (fallbackCourses.length === 0) {
          console.log('Database is empty, seeding with initial data...');
          await seedInitialData();
          await LinkedListCourseService.initializeFromOrderIndex();
          courses = await LinkedListCourseService.getOrderedCourses();
        } else {
          console.log('🔄 Initializing linked list from existing order_index data...');
          await LinkedListCourseService.initializeFromOrderIndex();
          courses = await LinkedListCourseService.getOrderedCourses();
        }
      }
      
      setData(courses);
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

  // CUT/COPY/PASTE FUNCTIONS
  const handleCutCourses = (courses: Course[]) => {
    console.log('✂️ === CUT OPERATION START ===');
    console.log('Selected courses in UI order:', courses.map((c, i) => `${i+1}. ${c.title} (ID: ${c.id}, Display: ${c.displayOrder || 'N/A'})`));
    console.log('UI data order at time of cut:', data.map((c, i) => `${i+1}. ${c.title} (Display: ${c.displayOrder || 'N/A'})`));
    
    setClipboard({ action: 'cut', courses });
    console.log('✂️ Cut operation complete. Clipboard set with', courses.length, 'courses');
    console.log('✂️ === CUT OPERATION END ===\n');
  };

  const handleCopyCourses = (courses: Course[]) => {
    console.log('📋 === COPY OPERATION START ===');
    console.log('Selected courses in UI order:', courses.map((c, i) => `${i+1}. ${c.title} (ID: ${c.id}, Display: ${c.displayOrder || 'N/A'})`));
    console.log('UI data order at time of copy:', data.map((c, i) => `${i+1}. ${c.title} (Display: ${c.displayOrder || 'N/A'})`));
    
    setClipboard({ action: 'copy', courses });
    console.log('📋 Copy operation complete. Clipboard set with', courses.length, 'courses');
    console.log('📋 === COPY OPERATION END ===\n');
  };

  const handlePasteBelow = async (targetCourse: Course) => {
    if (!clipboard || clipboard.courses.length === 0) {
      console.warn('📄 No clipboard data to paste');
      return;
    }

    try {
      const { action, courses: clipboardCourses } = clipboard;
      
      console.log('📄 === PASTE OPERATION START ===');
      console.log(`Action: ${action.toUpperCase()}`);
      console.log(`Target course: ${targetCourse.title} (ID: ${targetCourse.id}, Display: ${targetCourse.displayOrder || 'N/A'})`);
      console.log('Clipboard contents (in order):', clipboardCourses.map((c, i) => `${i+1}. ${c.title} (ID: ${c.id})`));
      console.log('Current UI order before paste:', data.map((c, i) => `${i+1}. ${c.title} (Display: ${c.displayOrder || 'N/A'})`));
      
      let currentTargetId = targetCourse.id;
      console.log(`Starting with target ID: ${currentTargetId}`);
      
      for (let i = 0; i < clipboardCourses.length; i++) {
        const course = clipboardCourses[i];
        console.log(`\n--- Processing course ${i + 1}/${clipboardCourses.length}: ${course.title} ---`);
        console.log(`Current target ID: ${currentTargetId}`);
        
        if (action === 'copy') {
          // Create new course below current target
          const newCourse = {
            id: `NEW${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            title: `${course.title} (Copy)`,
            instructor: course.instructor,
          };
          console.log(`Creating copy: ${newCourse.title} (ID: ${newCourse.id})`);
          console.log(`Inserting below: ${currentTargetId}`);
          
          const created = await LinkedListCourseService.insertCourseBelow(currentTargetId, newCourse);
          console.log(`Created course returned:`, created);
          currentTargetId = created.id; // Next course goes below this one
          console.log(`Next target ID updated to: ${currentTargetId}`);
        } else {
          // Move existing course below current target
          console.log(`Moving existing course: ${course.title} (ID: ${course.id})`);
          console.log(`Moving below: ${currentTargetId}`);
          
          await LinkedListCourseService.moveCourseBelow(course.id, currentTargetId);
          console.log(`Move completed`);
          currentTargetId = course.id; // Next course goes below this one
          console.log(`Next target ID updated to: ${currentTargetId}`);
        }
      }
      
      console.log('\n--- All courses processed, refreshing UI ---');
      
      // Clear clipboard after cut (not copy)
      if (action === 'cut') {
        console.log('Clearing clipboard (cut operation)');
        setClipboard(null);
      }
      
      // Clear selection and refresh
      setRowSelection({});
      await loadCourses();
      
      console.log('📄 === PASTE OPERATION END ===\n');
      
    } catch (err) {
      console.error('🚨 PASTE FAILED:', err);
      setError('Failed to paste courses');
    }
  };

  const handleBulkDelete = async (rows: any[]) => {
    try {
      const courseIds = rows.map(row => row.original.id);
      console.log('Bulk deleting courses:', courseIds);
      
      for (const courseId of courseIds) {
        await CourseService.deleteCourse(courseId);
      }
      
      // Clear selection after successful delete
      setRowSelection({});
      // Data will be updated via real-time subscription
    } catch (err) {
      console.error('Failed to bulk delete courses:', err);
      setError('Failed to delete selected courses');
    }
  };

  const handleBulkEdit = async (rows: any[]) => {
    try {
      console.log('Bulk editing courses:', rows.map(r => r.original));
      // For now, just log the selected rows
      // You could implement batch editing UI here
      alert(`Selected ${rows.length} courses for editing:\n${rows.map(r => r.original.title).join('\n')}`);
    } catch (err) {
      console.error('Failed to bulk edit courses:', err);
      setError('Failed to edit selected courses');
    }
  };

  // Legacy decimal ordering functions removed - using linked list approach now

  const handleInsertBelow = async (row: any) => {
    try {
      const currentCourse = row.original;
      
      // Use linked list approach - O(1) operation!
      const newCourse = {
        id: `NEW${Date.now()}`,
        title: '', // BLANK title
        instructor: '', // BLANK instructor  
      };
      
      console.log(`🚀 Inserting blank course below ${currentCourse.id} using linked list`);
      await LinkedListCourseService.insertCourseBelow(currentCourse.id, newCourse);
      
      // Force immediate UI refresh
      await loadCourses();
      
    } catch (err) {
      console.error('Failed to insert course below:', err);
      setError('Failed to insert course below');
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
      rowSelection,
    },
    // Column ordering (drag and drop columns)
    enableColumnOrdering: true,
    onColumnOrderChange: setColumnOrder,
    onColumnVisibilityChange: setColumnVisibility,
    // Editing functionality
    enableEditing: true,
    editDisplayMode: 'row',
    onEditingRowSave: handleSaveCourse,
    // Row selection
    enableRowSelection: true,
    enableMultiRowSelection: true,
    onRowSelectionChange: setRowSelection,
    // Search and filtering
    enableColumnFilters: true,
    enableGlobalFilter: true,
    enableColumnFilterModes: true,
    enableClickToCopy: true, // Built-in copy functionality
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
    // Row actions with dropdown menu
    enableRowActions: true,
    renderRowActionMenuItems: ({ row }) => {
      const selectedRows = table.getSelectedRowModel().rows;
      const isSelected = selectedRows.length > 0;
      const courses = isSelected ? selectedRows.map(r => r.original) : [row.original];
      
      return (
        <>
          <Menu.Item 
            leftSection={<IconEdit size={16} />}
            onClick={() => table.setEditingRow(row)}
          >
            Edit Course
          </Menu.Item>
          <Menu.Item 
            leftSection={<IconPlus size={16} />}
            onClick={() => handleInsertBelow(row)}
          >
            Insert Below
          </Menu.Item>
          <Menu.Divider />
          {/* CUT/COPY ACTIONS */}
          <Menu.Item 
            leftSection={<span style={{fontSize: '16px'}}>✂️</span>}
            onClick={() => handleCutCourses(courses)}
          >
            Cut {isSelected ? `${courses.length} Courses` : 'Course'}
          </Menu.Item>
          <Menu.Item 
            leftSection={<span style={{fontSize: '16px'}}>📋</span>}
            onClick={() => handleCopyCourses(courses)}
          >
            Copy {isSelected ? `${courses.length} Courses` : 'Course'}
          </Menu.Item>
          {clipboard && (
            <Menu.Item 
              leftSection={<span style={{fontSize: '16px'}}>📄</span>}
              onClick={() => handlePasteBelow(row.original)}
            >
              Paste {clipboard.courses.length} Course{clipboard.courses.length > 1 ? 's' : ''} Below
            </Menu.Item>
          )}
          <Menu.Divider />
          <Menu.Item 
            leftSection={<IconTrash size={16} />}
            color="red"
            onClick={() => handleBulkDelete([row])}
          >
            Delete Course
          </Menu.Item>
        </>
      );
    },
    renderTopToolbarCustomActions: ({ table }) => {
      const selectedRows = table.getSelectedRowModel().rows;
      const selectedCourses = selectedRows.map(r => r.original);
      
      return (
        <Flex gap="sm">
          <Button onClick={handleAddCourse} variant="filled">
            Add Course
          </Button>
          {selectedRows.length > 0 && (
            <>
              <Button 
                onClick={() => handleCutCourses(selectedCourses)}
                variant="light"
                color="blue"
              >
                ✂️ Cut {selectedRows.length} Selected
              </Button>
              <Button 
                onClick={() => handleCopyCourses(selectedCourses)}
                variant="light"
                color="teal"
              >
                📋 Copy {selectedRows.length} Selected
              </Button>
              <Button 
                onClick={() => handleBulkDelete(selectedRows)}
                variant="light" 
                color="red"
              >
                Delete {selectedRows.length} Selected
              </Button>
            </>
          )}
          {clipboard && (
            <Button 
              variant="light"
              color="green"
              disabled
            >
              📄 {clipboard.courses.length} Course{clipboard.courses.length > 1 ? 's' : ''} in Clipboard ({clipboard.action})
            </Button>
          )}
        </Flex>
      );
    },
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
