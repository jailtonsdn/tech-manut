
import fetchAPI from './api';
import { MaintenanceRecord } from '@/types';

// Quando estiver em desenvolvimento, continua usando o localStorage
const isDev = process.env.NODE_ENV === 'development';

const mapRecordFromAPI = (record: any): MaintenanceRecord => ({
  id: record.id,
  nome_equipamento: record.nome_equipamento,
  placa_patrimonio: record.placa_patrimonio,
  filial: record.filial,
  setor: record.setor,
  destino: record.destino,
  data_abertura: record.data_abertura,
  data_entrega: record.data_entrega,
  data_devolucao: record.data_devolucao,
  status: record.status,
  observacao: record.observacao,
  imagem: record.imagem,
  excluido: record.excluido
});

export const getMaintenanceRecords = async (): Promise<MaintenanceRecord[]> => {
  try {
    if (isDev) {
      const storedData = localStorage.getItem('maintenanceRecords');
      return storedData ? JSON.parse(storedData) : [];
    }
    
    const response = await fetchAPI<any[]>('/maintenance');
    return response.map(mapRecordFromAPI);
  } catch (error) {
    console.error('Erro ao buscar registros:', error);
    return [];
  }
};

export const addMaintenanceRecord = async (
  record: Omit<MaintenanceRecord, 'id'>
): Promise<MaintenanceRecord> => {
  if (isDev) {
    const newRecord = {
      ...record,
      id: Date.now()
    };
    
    const currentRecords = localStorage.getItem('maintenanceRecords');
    const parsedRecords = currentRecords ? JSON.parse(currentRecords) : [];
    const updatedRecords = [newRecord, ...parsedRecords];
    
    localStorage.setItem('maintenanceRecords', JSON.stringify(updatedRecords));
    return newRecord;
  }
  
  const response = await fetchAPI<any>('/maintenance', 'POST', record);
  return mapRecordFromAPI(response);
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
  
  const response = await fetchAPI<any>(`/maintenance/${updatedRecord.id}`, 'PUT', updatedRecord);
  return mapRecordFromAPI(response);
};

export const deleteMaintenanceRecord = async (id: number): Promise<void> => {
  if (isDev) {
    const currentRecords = localStorage.getItem('maintenanceRecords');
    const parsedRecords = currentRecords ? JSON.parse(currentRecords) : [];
    const updatedRecords = parsedRecords.filter((record: MaintenanceRecord) => record.id !== id);
    
    localStorage.setItem('maintenanceRecords', JSON.stringify(updatedRecords));
    return;
  }
  
  await fetchAPI<void>(`/maintenance/${id}`, 'DELETE');
};
