
import fetchAPI from './api';
import { MaintenanceRecord, MaintenanceStatus } from '@/types';

// Quando estiver em desenvolvimento, continua usando o localStorage
const isDev = process.env.NODE_ENV === 'development';

// Função para validar se uma string é uma data válida
const isValidDate = (dateString: string | undefined): boolean => {
  if (!dateString) return false;
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

// Funções de mapeamento entre os campos do MySQL e os campos do frontend
function mapToFrontendFields(record: any): MaintenanceRecord {
  // Mapear o status do banco para o formato de MaintenanceStatus
  let statusMapped: MaintenanceStatus = 'received';
  if (record.status === 'sent' || record.status === 'em_manutencao') {
    statusMapped = 'sent';
  } else if (record.status === 'completed' || record.status === 'concluido') {
    statusMapped = 'completed';
  }

  // Garantir que as datas sejam válidas
  const dateReceived = isValidDate(record.data_abertura) ? record.data_abertura : '';
  const dateSentToService = isValidDate(record.data_entrega) ? record.data_entrega : '';
  const dateReturned = isValidDate(record.data_devolucao) ? record.data_devolucao : '';

  return {
    id: record.id || 0,
    // Campos originais do banco
    nome_equipamento: record.nome_equipamento || '',
    placa_patrimonio: record.placa_patrimonio || '',
    filial: record.filial || 0,
    setor: record.setor || '',
    destino: record.destino || '',
    data_abertura: dateReceived,
    data_entrega: dateSentToService,
    data_devolucao: dateReturned,
    status: statusMapped,
    observacao: record.observacao || '',
    imagem: record.imagem || '',
    excluido: record.excluido || 'N',
    
    // Mapeamento para campos amigáveis
    equipmentName: record.nome_equipamento || '',
    assetTag: record.placa_patrimonio || '',
    branch: record.filial ? record.filial.toString() : '',
    department: record.setor || '',
    dateReceived: dateReceived,
    dateSentToService: dateSentToService,
    dateReturned: dateReturned,
    notes: record.observacao || '',
    equipmentType: record.equipmentType || 'computer' // Valor padrão
  };
}

function mapToBackendFields(record: Partial<MaintenanceRecord>): Partial<MaintenanceRecord> {
  const backendRecord: Partial<MaintenanceRecord> = {
    ...record,
    // Mapeia de volta para os campos do banco de dados
    nome_equipamento: record.equipmentName || '',
    placa_patrimonio: record.assetTag || '',
    filial: record.branch ? parseInt(record.branch) : 0,
    setor: record.department || '',
    data_abertura: record.dateReceived || '',
    data_entrega: record.dateSentToService || '',
    data_devolucao: record.dateReturned || '',
    observacao: record.notes || '',
    // Status permanece o mesmo
    // Outros campos específicos do backend
    imagem: record.imagem || '', // Campo necessário
    excluido: record.excluido || 'N' // Padrão 'N' para não excluído
  };
  
  return backendRecord;
}

const mapRecordFromAPI = (record: any): MaintenanceRecord => {
  if (!record) {
    return {
      id: 0,
      nome_equipamento: '',
      placa_patrimonio: '',
      filial: 0,
      data_abertura: '',
      status: 'received',
      equipmentName: '',
      assetTag: '',
      branch: '',
      dateReceived: '',
      equipmentType: 'computer'
    };
  }
  
  const mappedRecord = {
    id: record.id || 0,
    nome_equipamento: record.nome_equipamento || '',
    placa_patrimonio: record.placa_patrimonio || '',
    filial: record.filial || 0,
    setor: record.setor || '',
    destino: record.destino || '',
    data_abertura: record.data_abertura || '',
    data_entrega: record.data_entrega || '',
    data_devolucao: record.data_devolucao || '',
    status: record.status || 'received',
    observacao: record.observacao || '',
    imagem: record.imagem || '',
    excluido: record.excluido || 'N'
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
      return records.map((record: any) => mapToFrontendFields(record));
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
