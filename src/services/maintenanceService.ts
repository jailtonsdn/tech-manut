
import fetchAPI from './api';
import { MaintenanceRecord } from '@/types';

// Quando estiver em desenvolvimento, continua usando o localStorage
const isDev = process.env.NODE_ENV === 'development';

// Funções de mapeamento entre os campos do MySQL e os campos do frontend
function mapToFrontendFields(record: MaintenanceRecord): MaintenanceRecord {
  return {
    ...record,
    // Mapeia campos do banco para nomes amigáveis no frontend
    equipmentName: record.nome_equipamento,
    assetTag: record.placa_patrimonio,
    branch: record.filial.toString(),
    department: record.setor,
    dateReceived: record.data_abertura,
    dateSentToService: record.data_entrega,
    dateReturned: record.data_devolucao,
    notes: record.observacao,
    // Adicionar mapeamento de status
    // Definir equipmentType com base em alguma lógica ou campo padrão
    equipmentType: 'computer', // Valor padrão, ajuste conforme necessário
  };
}

function mapToBackendFields(record: Partial<MaintenanceRecord>): Partial<MaintenanceRecord> {
  const backendRecord: Partial<MaintenanceRecord> = {
    ...record,
    // Mapeia de volta para os campos do banco de dados
    nome_equipamento: record.equipmentName,
    placa_patrimonio: record.assetTag,
    filial: record.branch ? parseInt(record.branch) : undefined,
    setor: record.department,
    data_abertura: record.dateReceived,
    data_entrega: record.dateSentToService,
    data_devolucao: record.dateReturned,
    observacao: record.notes,
    // Status permanece o mesmo
    // Outros campos específicos do backend
    imagem: record.imagem || '', // Campo necessário
    excluido: record.excluido || 'N' // Padrão 'N' para não excluído
  };
  
  return backendRecord;
}

const mapRecordFromAPI = (record: any): MaintenanceRecord => {
  const mappedRecord = {
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
  };
  
  // Retorna o registro com os campos mapeados para o frontend
  return mapToFrontendFields(mappedRecord);
};

export const getMaintenanceRecords = async (): Promise<MaintenanceRecord[]> => {
  try {
    if (isDev) {
      const storedData = localStorage.getItem('maintenanceRecords');
      const records = storedData ? JSON.parse(storedData) : [];
      // Mapeia os registros para o formato do frontend
      return records.map(mapToFrontendFields);
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
    // Converte para o formato do backend
    const backendRecord = mapToBackendFields(record);
    
    const newRecord = {
      ...backendRecord,
      id: Date.now()
    } as MaintenanceRecord;
    
    const currentRecords = localStorage.getItem('maintenanceRecords');
    const parsedRecords = currentRecords ? JSON.parse(currentRecords) : [];
    const updatedRecords = [newRecord, ...parsedRecords];
    
    localStorage.setItem('maintenanceRecords', JSON.stringify(updatedRecords));
    return mapToFrontendFields(newRecord);
  }
  
  // Converte para o formato do backend antes de enviar para a API
  const backendRecord = mapToBackendFields(record);
  const response = await fetchAPI<any>('/maintenance', 'POST', backendRecord);
  return mapRecordFromAPI(response);
};

export const updateMaintenanceRecord = async (
  updatedRecord: MaintenanceRecord
): Promise<MaintenanceRecord> => {
  if (isDev) {
    // Converte para o formato do backend
    const backendRecord = mapToBackendFields(updatedRecord);
    
    const currentRecords = localStorage.getItem('maintenanceRecords');
    const parsedRecords = currentRecords ? JSON.parse(currentRecords) : [];
    const updatedRecords = parsedRecords.map((record: MaintenanceRecord) => 
      record.id === updatedRecord.id ? {...record, ...backendRecord} : record
    );
    
    localStorage.setItem('maintenanceRecords', JSON.stringify(updatedRecords));
    return mapToFrontendFields({...updatedRecord, ...backendRecord} as MaintenanceRecord);
  }
  
  // Converte para o formato do backend antes de enviar para a API
  const backendRecord = mapToBackendFields(updatedRecord);
  const response = await fetchAPI<any>(`/maintenance/${updatedRecord.id}`, 'PUT', backendRecord);
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
