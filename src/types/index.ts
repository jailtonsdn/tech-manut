
export type MaintenanceStatus = 'received' | 'sent' | 'completed';
export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  name: string;
  role: UserRole;
}

// Atualizando para corresponder à estrutura do seu banco de dados
export interface MaintenanceRecord {
  id: number; // Alterado para number pois é int(11) no MySQL
  nome_equipamento: string;
  placa_patrimonio: string;
  filial: number;
  setor?: string;
  destino?: string;
  data_abertura: string;
  data_entrega?: string;
  data_devolucao?: string;
  status: string;
  observacao: string;
  imagem: string;
  excluido: string;
}
