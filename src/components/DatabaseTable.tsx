import GenericDataTable from './GenericDataTable';
import { courseTableConfig } from '../configs/tableConfigs';

// Legacy wrapper: Uses new generic system with original behavior
export function DatabaseTable() {
  return <GenericDataTable config={courseTableConfig} />;
}
