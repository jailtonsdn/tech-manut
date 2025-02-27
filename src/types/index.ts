
export type MaintenanceStatus = 'received' | 'sent' | 'completed';
export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  name: string;
  role: UserRole;
}

export interface MaintenanceRecord {
  id: number;
  // Campos originais do banco
  nome_equipamento?: string;
  placa_patrimonio?: string;
  filial?: number;
  setor?: string;
  destino?: string;
  data_abertura?: string;
  data_entrega?: string;
  data_devolucao?: string;
  status: string;
  observacao?: string;
  imagem?: string;
  excluido?: string;
  
  // Mapeamento para campos amigáveis (para compatibilidade com o código existente)
  equipmentName: string;
  assetTag: string;
  branch: string;
  department?: string;
  dateReceived: string;
  dateSentToService?: string;
  dateReturned?: string;
  equipmentType: string;
  notes?: string;
  invoiceNumber?: string;
  value?: number;
  registeredBy?: string;
}
