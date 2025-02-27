
import { useState } from 'react';
import { format } from 'date-fns';
import { MaintenanceRecord } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import StatusBadge from './StatusBadge';
import MaintenanceForm from './MaintenanceForm';
import { Pencil, Trash2, Eye, Truck, CheckCircle, User } from 'lucide-react';
import { deleteMaintenanceRecord, updateMaintenanceRecord } from '@/data/maintenanceData';
import { useToast } from '@/hooks/use-toast';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface MaintenanceTableProps {
  records: MaintenanceRecord[];
  onUpdate: () => void;
}

const MaintenanceTable = ({ records, onUpdate }: MaintenanceTableProps) => {
  const { toast } = useToast();
  const [selectedRecord, setSelectedRecord] = useState<MaintenanceRecord | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [dateSent, setDateSent] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [dateReturned, setDateReturned] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [value, setValue] = useState('');
  
  const handleDelete = (id: string) => {
    deleteMaintenanceRecord(id);
    toast({
      title: "Registro excluído",
      description: "O registro foi removido com sucesso.",
    });
    onUpdate();
  };
  
  const handleSendToService = () => {
    if (!selectedRecord) return;
    
    if (!dateSent) {
      toast({
        title: "Data obrigatória",
        description: "Por favor, informe a data de envio.",
        variant: "destructive"
      });
      return;
    }

    updateMaintenanceRecord({
      ...selectedRecord,
      status: 'sent',
      dateSentToService: dateSent
    });
    toast({
      title: "Status atualizado",
      description: "Equipamento enviado para manutenção.",
    });
    setShowSendDialog(false);
    onUpdate();
  };
  
  const handleCompleteService = () => {
    if (!selectedRecord) return;
    
    if (!dateReturned) {
      toast({
        title: "Data obrigatória",
        description: "Por favor, informe a data de retorno.",
        variant: "destructive"
      });
      return;
    }

    updateMaintenanceRecord({
      ...selectedRecord,
      status: 'completed',
      dateReturned: dateReturned,
      invoiceNumber: invoiceNumber,
      value: value ? parseFloat(value) : undefined
    });
    toast({
      title: "Status atualizado",
      description: "Manutenção concluída com sucesso.",
    });
    setShowCompleteDialog(false);
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
              <TableHead>Registrado por</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6 text-gray-500">
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
                  <TableCell>
                    {record.registeredBy ? (
                      <span className="flex items-center">
                        <User className="h-3 w-3 mr-1 text-gray-400" />
                        {record.registeredBy}
                      </span>
                    ) : '-'}
                  </TableCell>
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
                      
                      {record.status === 'received' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          onClick={() => {
                            setSelectedRecord(record);
                            setShowSendDialog(true);
                          }}
                        >
                          <Truck className="h-4 w-4" />
                          <span className="sr-only">Entregue</span>
                        </Button>
                      )}
                      
                      {record.status === 'sent' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={() => {
                            setSelectedRecord(record);
                            setShowCompleteDialog(true);
                          }}
                        >
                          <CheckCircle className="h-4 w-4" />
                          <span className="sr-only">Devolvido</span>
                        </Button>
                      )}
                      
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
                
                {selectedRecord.registeredBy && (
                  <div>
                    <p className="text-gray-500">Registrado por</p>
                    <p className="font-medium">{selectedRecord.registeredBy}</p>
                  </div>
                )}
                
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
      
      {/* Send to Service Dialog */}
      <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <DialogContent>
          <h3 className="text-lg font-medium mb-4">Entregue para Manutenção</h3>
          <form onSubmit={(e) => { e.preventDefault(); handleSendToService(); }}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="dateSent">Data de Entrega</Label>
                <Input
                  id="dateSent"
                  type="date"
                  value={dateSent}
                  onChange={(e) => setDateSent(e.target.value)}
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" type="button" onClick={() => setShowSendDialog(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Confirmar</Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Complete Service Dialog */}
      <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <DialogContent>
          <h3 className="text-lg font-medium mb-4">Devolvido da Manutenção</h3>
          <form onSubmit={(e) => { e.preventDefault(); handleCompleteService(); }}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="dateReturned">Data de Devolução</Label>
                <Input
                  id="dateReturned"
                  type="date"
                  value={dateReturned}
                  onChange={(e) => setDateReturned(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invoiceNumber">Número NFE</Label>
                <Input
                  id="invoiceNumber"
                  placeholder="Ex: NFE-5678"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="value">Valor (R$)</Label>
                <Input
                  id="value"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" type="button" onClick={() => setShowCompleteDialog(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Confirmar</Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MaintenanceTable;
