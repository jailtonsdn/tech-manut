
export type MaintenanceStatus = 'received' | 'sent' | 'completed';

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
}
