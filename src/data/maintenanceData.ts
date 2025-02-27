
import { 
  getMaintenanceRecords as getRecords,
  addMaintenanceRecord as addRecord,
  updateMaintenanceRecord as updateRecord,
  deleteMaintenanceRecord as deleteRecord
} from '@/services/maintenanceService';
import { MaintenanceRecord } from '@/types';

export const getMaintenanceRecords = async (): Promise<MaintenanceRecord[]> => {
  const records = await getRecords();
  return records;
};

export const addMaintenanceRecord = async (
  record: Omit<MaintenanceRecord, 'id'>
): Promise<MaintenanceRecord> => {
  try {
    return await addRecord(record);
  } catch (error) {
    console.error('Erro ao adicionar registro:', error);
    throw error;
  }
};

export const updateMaintenanceRecord = async (
  updatedRecord: MaintenanceRecord
): Promise<MaintenanceRecord> => {
  try {
    return await updateRecord(updatedRecord);
  } catch (error) {
    console.error('Erro ao atualizar registro:', error);
    throw error;
  }
};

export const deleteMaintenanceRecord = async (id: number): Promise<void> => {
  try {
    await deleteRecord(id);
  } catch (error) {
    console.error('Erro ao excluir registro:', error);
    throw error;
  }
};
