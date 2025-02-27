
export type MaintenanceStatus = 'received' | 'sent' | 'completed';
export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  name: string;
  role: UserRole;
}

export interface MaintenanceRecord {
  id: string;
  equipmentName: string;
  assetTag: string;
  dateReceived: string;
  dateSentToService?: string;
  dateReturned?: string;
  status: MaintenanceStatus;
  invoiceNumber?: string;
  value?: number;
  notes?: string;
  equipmentType: 'ups' | 'printer' | 'computer';
  branch?: string;
  department?: string;
  registeredBy?: string; // Nome do usuário que registrou
}
