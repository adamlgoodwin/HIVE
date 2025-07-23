import { useState, useEffect } from 'react';
import { MantineReactTable, useMantineReactTable, type MRT_RowData } from 'mantine-react-table';
import { Box, Button, Alert, Flex, Menu } from '@mantine/core';
import { IconInfoCircle, IconEdit, IconTrash, IconPlus } from '@tabler/icons-react';
import type { GenericTableConfig } from '../interfaces/genericTable';

interface GenericDataTableProps<T extends MRT_RowData> {
  config: GenericTableConfig<T>;
}

export default function GenericDataTable<T extends MRT_RowData>({ config }: GenericDataTableProps<T>) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [columnOrder, setColumnOrder] = useState<string[]>([]);
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({});

  // Extract config properties
  const {
    columns,
    dataService,
    orderingService,
    entityName,
    tableTitle = `${entityName} Management`,
    addButtonText = `Add ${entityName}`,
    emptyStateText = `No ${entityName} found`,
    features = {},
    initialState,
    seedInitialData,
  } = config;

  const activeFeatures = { ...features };

  // Load initial data
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const items = await dataService.getAllItems();
      setData(items);
    } catch (err) {
      console.error(`Failed to load ${entityName}:`, err);
      setError(`Failed to load ${entityName} data`);
    } finally {
      setLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    loadData();
    
    // Seed initial data if needed
    if (seedInitialData) {
      seedInitialData().catch(console.error);
    }
  }, []);

  // Real-time subscription
  useEffect(() => {
    const cleanup = setupRealtimeSubscription();
    return cleanup;
  }, []);

  const setupRealtimeSubscription = () => {
    if (activeFeatures.realtime && dataService.subscribeToChanges) {
      const subscription = dataService.subscribeToChanges((payload: any) => {
        console.log('Real-time update:', payload);
        loadData();
      });
      
      return subscription ? () => subscription.unsubscribe() : () => {};
    }
    return () => {};
  };

  // Generic handlers
  const handleSaveCell = async (cell: any, value: any) => {
    if (!activeFeatures.editing) return;
    try {
      const row = cell.row.original;
      const updatedItem = { ...row, [cell.column.id]: value };
      await dataService.updateItem(row.id, updatedItem);
      await loadData();
    } catch (err) {
      console.error(`Failed to update ${entityName}:`, err);
      setError(`Failed to update ${entityName}`);
    }
  };

  const handleDeleteRow = async (row: any) => {
    try {
      await dataService.deleteItem(row.original.id);
      await loadData();
    } catch (err) {
      console.error(`Failed to delete ${entityName}:`, err);
      setError(`Failed to delete ${entityName}`);
    }
  };

  const handleBulkDelete = async (rows: any[]) => {
    try {
      for (const row of rows) {
        await dataService.deleteItem(row.original.id);
      }
      setRowSelection({});
      await loadData();
    } catch (err) {
      console.error(`Failed to delete ${entityName}:`, err);
      setError(`Failed to delete selected ${entityName}`);
    }
  };

  const handleAdd = async () => {
    try {
      // Create blank item
      const newItem = {} as any; // Will be filled with defaults
      await dataService.createItem(newItem);
      await loadData();
    } catch (err) {
      console.error(`Failed to add ${entityName}:`, err);
      setError(`Failed to add ${entityName}`);
    }
  };

  // Create Mantine React Table instance
  const table = useMantineReactTable<T>({
    columns,
    data,
    state: {
      isLoading: loading,
      columnOrder: activeFeatures.columnOrdering ? columnOrder : undefined,
      columnVisibility: activeFeatures.columnVisibility ? columnVisibility : undefined,
      rowSelection: activeFeatures.bulkOperations ? rowSelection : undefined,
    },
    // Column ordering
    enableColumnOrdering: activeFeatures.columnOrdering || false,
    onColumnOrderChange: activeFeatures.columnOrdering ? setColumnOrder : undefined,
    // Column visibility
    enableHiding: activeFeatures.columnVisibility || false,
    onColumnVisibilityChange: activeFeatures.columnVisibility ? setColumnVisibility : undefined,
    // Editing
    enableEditing: activeFeatures.editing || false,
    editDisplayMode: 'cell',
    onEditingCellChange: ({ cell, value }: any) => handleSaveCell(cell, value),
    // Row selection
    enableRowSelection: activeFeatures.bulkOperations || false,
    enableMultiRowSelection: activeFeatures.bulkOperations || false,
    onRowSelectionChange: activeFeatures.bulkOperations ? setRowSelection : undefined,
    // Filtering
    enableColumnFilters: activeFeatures.filtering || false,
    enableGlobalFilter: activeFeatures.filtering || false,
    enableColumnFilterModes: activeFeatures.filtering || false,
    enableClickToCopy: true,
    initialState: {
      showColumnFilters: activeFeatures.filtering || false,
      showGlobalFilter: activeFeatures.filtering || false,
      ...initialState,
    },
    // Styling
    mantineTableProps: { 
      ...config.styling?.tableProps, 
      style: { border: '1px solid #e0e0e0', ...config.styling?.tableProps?.style } 
    },
    mantineTableHeadProps: {
      style: { backgroundColor: '#f8f9fa' },
      ...config.styling?.headProps,
    },
    mantineTableBodyRowProps: {
      style: { cursor: 'pointer' },
      ...config.styling?.bodyRowProps,
    },
    // Row actions
    enableRowActions: true,
    renderRowActionMenuItems: ({ row }: any) => {
      const selectedRows: any[] = table.getSelectedRowModel().rows;
      const isSelected: boolean = selectedRows.length > 0;
      const items: T[] = isSelected ? selectedRows.map((r: any) => r.original) : [row.original];
      
      return (
        <>
          {activeFeatures.editing && (
            <Menu.Item 
              leftSection={<IconEdit size={16} />}
              onClick={() => table.setEditingRow(row)}
            >
              Edit {entityName}
            </Menu.Item>
          )}
          {activeFeatures.ordering && orderingService && (
            <Menu.Item 
              leftSection={<IconPlus size={16} />}
              onClick={async () => {
                const newItem = {} as any;
                await orderingService.insertBelow(row.original.id, newItem);
                await loadData();
              }}
            >
              Insert Below
            </Menu.Item>
          )}
          {activeFeatures.deleting && (
            <Menu.Item
              leftSection={<IconTrash size={16} />}
              onClick={() => handleDeleteRow(row)}
            >
              Delete {entityName}
            </Menu.Item>
          )}
          {activeFeatures.bulkOperations && selectedRows.length > 1 && (
            <Menu.Item
              leftSection={<IconTrash size={16} />}
              color="red"
              onClick={() => handleBulkDelete(items)}
            >
              Delete Selected
            </Menu.Item>
          )}
          {config.customActions?.rowActions?.({ row, items })}
        </>
      );
    },
    // Toolbar actions
    renderTopToolbarCustomActions: ({ table }: any) => {
      const selectedRows: any[] = table.getSelectedRowModel().rows;
      
      return (
        <Flex gap="sm">
          {activeFeatures.adding && (
            <Button onClick={handleAdd} variant="filled">
              {addButtonText}
            </Button>
          )}
          {activeFeatures.bulkOperations && selectedRows.length > 0 && (
            <Button 
              onClick={() => handleBulkDelete(selectedRows)}
              variant="light" 
              color="red"
            >
              Delete {selectedRows.length} Selected
            </Button>
          )}
          {config.customActions?.toolbarActions?.({ table, selectedRows })}
        </Flex>
      );
    },
  });

  if (error) {
    return (
      <Alert icon={<IconInfoCircle size="1rem" />} title="Database Error" color="red">
        {error}
        <Button size="xs" onClick={loadData} mt="sm">
          Retry
        </Button>
      </Alert>
    );
  }

  return (
    <Box>
      {tableTitle && (
        <Box mb="md">
          <h2>{tableTitle}</h2>
        </Box>
      )}
      
      <MantineReactTable table={table} />
      
      {data.length === 0 && !loading && (
        <Box ta="center" py="xl" c="dimmed">
          {emptyStateText}
        </Box>
      )}
    </Box>
  );
}
