
import fetchAPI from './api';
import { MaintenanceRecord } from '@/types';

// Quando estiver em desenvolvimento, continua usando o localStorage
const isDev = process.env.NODE_ENV === 'development';

// Adapta o serviço para funcionar com localStorage durante o desenvolvimento
// e com a API em produção
export const getMaintenanceRecords = async (): Promise<MaintenanceRecord[]> => {
  if (isDev) {
    const storedData = localStorage.getItem('maintenanceRecords');
    return storedData ? JSON.parse(storedData) : [];
  }
  
  return await fetchAPI<MaintenanceRecord[]>('/maintenance');
};

export const addMaintenanceRecord = async (
  record: Omit<MaintenanceRecord, 'id'>
): Promise<MaintenanceRecord> => {
  if (isDev) {
    const newRecord = {
      ...record,
      id: Date.now().toString(),
    };
    
    const currentRecords = localStorage.getItem('maintenanceRecords');
    const parsedRecords = currentRecords ? JSON.parse(currentRecords) : [];
    const updatedRecords = [newRecord, ...parsedRecords];
    
    localStorage.setItem('maintenanceRecords', JSON.stringify(updatedRecords));
    return newRecord;
  }
  
  return await fetchAPI<MaintenanceRecord>('/maintenance', 'POST', record);
};

export const updateMaintenanceRecord = async (
  updatedRecord: MaintenanceRecord
): Promise<MaintenanceRecord> => {
  if (isDev) {
    const currentRecords = localStorage.getItem('maintenanceRecords');
    const parsedRecords = currentRecords ? JSON.parse(currentRecords) : [];
    const updatedRecords = parsedRecords.map((record: MaintenanceRecord) => 
      record.id === updatedRecord.id ? updatedRecord : record
    );
    
    localStorage.setItem('maintenanceRecords', JSON.stringify(updatedRecords));
    return updatedRecord;
  }
  
  return await fetchAPI<MaintenanceRecord>(`/maintenance/${updatedRecord.id}`, 'PUT', updatedRecord);
};

export const deleteMaintenanceRecord = async (id: string): Promise<void> => {
  if (isDev) {
    const currentRecords = localStorage.getItem('maintenanceRecords');
    const parsedRecords = currentRecords ? JSON.parse(currentRecords) : [];
    const updatedRecords = parsedRecords.filter((record: MaintenanceRecord) => record.id !== id);
    
    localStorage.setItem('maintenanceRecords', JSON.stringify(updatedRecords));
    return;
  }
  
  await fetchAPI<void>(`/maintenance/${id}`, 'DELETE');
};
