
import { MaintenanceRecord } from '@/types';

// Load data from localStorage on initial load
const loadMaintenanceData = (): MaintenanceRecord[] => {
  const storedData = localStorage.getItem('maintenanceRecords');
  return storedData ? JSON.parse(storedData) : [];
};

// Save data to localStorage whenever it changes
const saveMaintenanceData = (data: MaintenanceRecord[]): void => {
  localStorage.setItem('maintenanceRecords', JSON.stringify(data));
};

// Get all maintenance records
export const getMaintenanceRecords = (): MaintenanceRecord[] => {
  return loadMaintenanceData();
};

// Add a new maintenance record
export const addMaintenanceRecord = (record: Omit<MaintenanceRecord, 'id'>): MaintenanceRecord => {
  const newRecord = {
    ...record,
    id: Date.now().toString(),
  };
  
  const currentRecords = loadMaintenanceData();
  const updatedRecords = [newRecord, ...currentRecords];
  
  saveMaintenanceData(updatedRecords);
  return newRecord;
};

// Update an existing record
export const updateMaintenanceRecord = (updatedRecord: MaintenanceRecord): MaintenanceRecord => {
  const currentRecords = loadMaintenanceData();
  const updatedRecords = currentRecords.map(record => 
    record.id === updatedRecord.id ? updatedRecord : record
  );
  
  saveMaintenanceData(updatedRecords);
  return updatedRecord;
};

// Delete a record
export const deleteMaintenanceRecord = (id: string): void => {
  const currentRecords = loadMaintenanceData();
  const updatedRecords = currentRecords.filter(record => record.id !== id);
  
  saveMaintenanceData(updatedRecords);
};
