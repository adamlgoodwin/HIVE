import { type MRT_ColumnDef, type MRT_RowData } from 'mantine-react-table';

// Generic data service interface - ANY entity can implement this
export interface IDataService<T> {
  getAllItems(): Promise<T[]>;
  createItem(item: Omit<T, 'id' | 'created_at' | 'updated_at'>): Promise<T>;
  updateItem(id: string, updates: Partial<T>): Promise<T>;
  deleteItem(id: string): Promise<void>;
  subscribeToChanges(callback: (payload: any) => void): { unsubscribe: () => void } | null;
}

// Generic ordering service interface - optional for tables that need ordering
export interface IOrderingService<T> {
  getOrderedItems(): Promise<T[]>;
  insertBelow(belowId: string, newItem: Omit<T, 'id' | 'next_id' | 'displayOrder'>): Promise<T>;
  moveBelow(itemId: string, targetId: string | null): Promise<void>;
  initializeFromIndex(): Promise<void>;
}

// Feature configuration - pick and choose what each table supports
export interface TableFeatures {
  editing?: boolean;
  adding?: boolean;
  deleting?: boolean;
  bulkOperations?: boolean;
  clipboard?: boolean;
  ordering?: boolean;
  columnOrdering?: boolean;
  columnVisibility?: boolean;
  filtering?: boolean;
  globalSearch?: boolean;
  realtime?: boolean;
  pagination?: boolean;
}

// Complete table configuration
export interface GenericTableConfig<T extends MRT_RowData> {
  // Required
  columns: MRT_ColumnDef<T>[];
  dataService: IDataService<T>;
  entityName: string; // 'course', 'student', 'assignment', etc.
  
  // Optional
  orderingService?: IOrderingService<T>;
  features?: TableFeatures;
  
  // Customization
  tableTitle?: string;
  addButtonText?: string;
  emptyStateText?: string;
  seedInitialData?: () => Promise<void>;
  initialState?: any;
  
  // Styling & Layout
  styling?: {
    tableProps?: any;
    headProps?: any;
    bodyRowProps?: any;
  };
  
  // Custom actions
  customActions?: {
    toolbarActions?: ({ table, selectedRows }: any) => React.ReactNode;
    rowActions?: ({ row, items }: any) => React.ReactNode;
  };
}
