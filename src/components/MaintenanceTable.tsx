
import { useState } from 'react';
import { format } from 'date-fns';
import { MaintenanceRecord } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import StatusBadge from './StatusBadge';
import MaintenanceForm from './MaintenanceForm';
import { Pencil, Trash2, Eye } from 'lucide-react';
import { deleteMaintenanceRecord } from '@/data/maintenanceData';
import { useToast } from '@/hooks/use-toast';

interface MaintenanceTableProps {
  records: MaintenanceRecord[];
  onUpdate: () => void;
}

const MaintenanceTable = ({ records, onUpdate }: MaintenanceTableProps) => {
  const { toast } = useToast();
  const [selectedRecord, setSelectedRecord] = useState<MaintenanceRecord | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  
  const handleDelete = (id: string) => {
    deleteMaintenanceRecord(id);
    toast({
      title: "Registro excluído",
      description: "O registro foi removido com sucesso.",
    });
    onUpdate();
  };
  
  const getEquipmentTypeLabel = (type: string) => {
    switch (type) {
      case 'ups': return 'Nobreak';
      case 'printer': return 'Impressora';
      case 'computer': return 'Computador';
      default: return type;
    }
  };

  const formatCurrency = (value?: number) => {
    if (value === undefined) return '-';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };
  
  return (
    <>
      <div className="rounded-md border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Equipamento</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Patrimônio</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Recebido em</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                  Nenhum registro encontrado.
                </TableCell>
              </TableRow>
            ) : (
              records.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.equipmentName}</TableCell>
                  <TableCell>{getEquipmentTypeLabel(record.equipmentType)}</TableCell>
                  <TableCell>{record.assetTag}</TableCell>
                  <TableCell>
                    <StatusBadge status={record.status} />
                  </TableCell>
                  <TableCell>{format(new Date(record.dateReceived), 'dd/MM/yyyy')}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedRecord(record);
                          setShowDetailsDialog(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">Detalhes</span>
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedRecord(record);
                          setShowEditDialog(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Editar</span>
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Excluir</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir este registro? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDelete(record.id)} 
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[600px] p-0">
          {selectedRecord && (
            <MaintenanceForm 
              existingRecord={selectedRecord} 
              onSubmit={() => {
                setShowEditDialog(false);
                onUpdate();
              }} 
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent>
          {selectedRecord && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Detalhes do Equipamento</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Nome</p>
                  <p className="font-medium">{selectedRecord.equipmentName}</p>
                </div>
                <div>
                  <p className="text-gray-500">Patrimônio</p>
                  <p className="font-medium">{selectedRecord.assetTag}</p>
                </div>
                <div>
                  <p className="text-gray-500">Tipo</p>
                  <p className="font-medium">{getEquipmentTypeLabel(selectedRecord.equipmentType)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Status</p>
                  <StatusBadge status={selectedRecord.status} />
                </div>
                <div>
                  <p className="text-gray-500">Recebido em</p>
                  <p className="font-medium">{format(new Date(selectedRecord.dateReceived), 'dd/MM/yyyy')}</p>
                </div>
                
                {selectedRecord.dateSentToService && (
                  <div>
                    <p className="text-gray-500">Enviado para manutenção em</p>
                    <p className="font-medium">{format(new Date(selectedRecord.dateSentToService), 'dd/MM/yyyy')}</p>
                  </div>
                )}
                
                {selectedRecord.dateReturned && (
                  <div>
                    <p className="text-gray-500">Retornado em</p>
                    <p className="font-medium">{format(new Date(selectedRecord.dateReturned), 'dd/MM/yyyy')}</p>
                  </div>
                )}
                
                {selectedRecord.invoiceNumber && (
                  <div>
                    <p className="text-gray-500">Número NFE</p>
                    <p className="font-medium">{selectedRecord.invoiceNumber}</p>
                  </div>
                )}
                
                {selectedRecord.value !== undefined && (
                  <div>
                    <p className="text-gray-500">Valor</p>
                    <p className="font-medium">{formatCurrency(selectedRecord.value)}</p>
                  </div>
                )}
              </div>
              
              {selectedRecord.notes && (
                <div>
                  <p className="text-gray-500">Observações</p>
                  <p className="mt-1">{selectedRecord.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MaintenanceTable;
