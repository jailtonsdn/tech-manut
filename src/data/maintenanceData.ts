
// Importamos do serviço que agora suporta tanto localStorage quanto API
import { 
  getMaintenanceRecords as getRecords,
  addMaintenanceRecord as addRecord,
  updateMaintenanceRecord as updateRecord,
  deleteMaintenanceRecord as deleteRecord
} from '@/services/maintenanceService';
import { MaintenanceRecord } from '@/types';

// Reexportamos as funções do serviço para manter compatibilidade
export const getMaintenanceRecords = async (): Promise<MaintenanceRecord[]> => {
  try {
    return await getRecords();
  } catch (error) {
    console.error('Erro ao buscar registros:', error);
    return [];
  }
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

export const deleteMaintenanceRecord = async (id: string): Promise<void> => {
  try {
    await deleteRecord(id);
  } catch (error) {
    console.error('Erro ao excluir registro:', error);
    throw error;
  }
};
