import { useState } from 'react';
import { MantineReactTable, type MRT_ColumnDef, useMantineReactTable } from 'mantine-react-table';
import { Box, Button, Flex } from '@mantine/core';
import { Course } from '../types/Course';

interface DraggableTableProps {
  initialData: Course[];
}

export function DraggableTable({ initialData }: DraggableTableProps) {
  const [data, setData] = useState<Course[]>(initialData);

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
  ];

  const table = useMantineReactTable({
    columns,
    data,
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
            setData(newData);
          }
        }
      },
    }),
    // Column ordering (drag and drop columns)
    enableColumnOrdering: true,
    // Editing functionality
    enableEditing: true,
    editDisplayMode: 'row',
    onEditingRowSave: ({ row, values }) => {
      const newData = [...data];
      newData[row.index] = values as Course;
      setData(newData);
    },
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
    mantineTableBodyRowProps: ({ row }) => ({
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
      <Button
        onClick={() => {
          const newCourse: Course = {
            id: `NEW${Date.now()}`,
            title: 'New Course',
            instructor: 'New Instructor',
          };
          setData([...data, newCourse]);
        }}
        variant="filled"
      >
        Add Course
      </Button>
    ),
  });

  return (
    <Box>
      <MantineReactTable table={table} />
    </Box>
  );
}
