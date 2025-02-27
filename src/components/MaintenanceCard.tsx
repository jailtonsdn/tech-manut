
import { useState } from 'react';
import { format } from 'date-fns';
import { MaintenanceRecord } from '@/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import StatusBadge from './StatusBadge';
import MaintenanceForm from './MaintenanceForm';
import { Pencil, Trash2, Info, Truck, CheckCircle } from 'lucide-react';
import { deleteMaintenanceRecord, updateMaintenanceRecord } from '@/data/maintenanceData';
import { useToast } from '@/hooks/use-toast';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface MaintenanceCardProps {
  record: MaintenanceRecord;
  onUpdate: () => void;
}

const MaintenanceCard = ({ record, onUpdate }: MaintenanceCardProps) => {
  const { toast } = useToast();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [dateSent, setDateSent] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [dateReturned, setDateReturned] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [value, setValue] = useState('');
  
  const handleDelete = () => {
    deleteMaintenanceRecord(record.id);
    toast({
      title: "Registro excluído",
      description: "O registro foi removido com sucesso.",
    });
    onUpdate();
  };
  
  const handleSendToService = () => {
    updateMaintenanceRecord({
      ...record,
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
    updateMaintenanceRecord({
      ...record,
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
    <Card className="w-full shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100">
      <CardContent className="pt-6">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-medium text-gray-900">{record.equipmentName}</h3>
            <p className="text-sm text-gray-500">Patrimônio: {record.assetTag}</p>
          </div>
          <StatusBadge status={record.status} />
        </div>
        
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4 text-sm">
          <div>
            <p className="text-gray-500">Tipo</p>
            <p>{getEquipmentTypeLabel(record.equipmentType)}</p>
          </div>
          <div>
            <p className="text-gray-500">Recebido em</p>
            <p>{format(new Date(record.dateReceived), 'dd/MM/yyyy')}</p>
          </div>
          
          {record.branch && (
            <div>
              <p className="text-gray-500">Filial</p>
              <p>{record.branch}</p>
            </div>
          )}
          
          {record.department && (
            <div>
              <p className="text-gray-500">Setor</p>
              <p>{record.department}</p>
            </div>
          )}
          
          {record.dateSentToService && (
            <div>
              <p className="text-gray-500">Enviado em</p>
              <p>{format(new Date(record.dateSentToService), 'dd/MM/yyyy')}</p>
            </div>
          )}
          
          {record.dateReturned && (
            <div>
              <p className="text-gray-500">Retornado em</p>
              <p>{format(new Date(record.dateReturned), 'dd/MM/yyyy')}</p>
            </div>
          )}
          
          {record.invoiceNumber && (
            <div>
              <p className="text-gray-500">NFE</p>
              <p>{record.invoiceNumber}</p>
            </div>
          )}
          
          {record.value !== undefined && (
            <div>
              <p className="text-gray-500">Valor</p>
              <p>{formatCurrency(record.value)}</p>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between flex-wrap pt-2 pb-4 gap-2">
        <div className="flex gap-2">
          <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-xs">
                <Pencil className="h-3.5 w-3.5 mr-1" />
                Editar
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] p-0">
              <MaintenanceForm 
                existingRecord={record} 
                onSubmit={() => {
                  setShowEditDialog(false);
                  onUpdate();
                }} 
              />
            </DialogContent>
          </Dialog>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-xs">
                <Info className="h-3.5 w-3.5 mr-1" />
                Detalhes
              </Button>
            </DialogTrigger>
            <DialogContent>
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Detalhes do Equipamento</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Nome</p>
                    <p className="font-medium">{record.equipmentName}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Patrimônio</p>
                    <p className="font-medium">{record.assetTag}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Tipo</p>
                    <p className="font-medium">{getEquipmentTypeLabel(record.equipmentType)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Status</p>
                    <StatusBadge status={record.status} />
                  </div>
                  <div>
                    <p className="text-gray-500">Recebido em</p>
                    <p className="font-medium">{format(new Date(record.dateReceived), 'dd/MM/yyyy')}</p>
                  </div>
                  
                  {record.branch && (
                    <div>
                      <p className="text-gray-500">Filial</p>
                      <p className="font-medium">{record.branch}</p>
                    </div>
                  )}
                  
                  {record.department && (
                    <div>
                      <p className="text-gray-500">Setor</p>
                      <p className="font-medium">{record.department}</p>
                    </div>
                  )}
                  
                  {record.dateSentToService && (
                    <div>
                      <p className="text-gray-500">Enviado para manutenção em</p>
                      <p className="font-medium">{format(new Date(record.dateSentToService), 'dd/MM/yyyy')}</p>
                    </div>
                  )}
                  
                  {record.dateReturned && (
                    <div>
                      <p className="text-gray-500">Retornado em</p>
                      <p className="font-medium">{format(new Date(record.dateReturned), 'dd/MM/yyyy')}</p>
                    </div>
                  )}
                  
                  {record.invoiceNumber && (
                    <div>
                      <p className="text-gray-500">Número NFE</p>
                      <p className="font-medium">{record.invoiceNumber}</p>
                    </div>
                  )}
                  
                  {record.value !== undefined && (
                    <div>
                      <p className="text-gray-500">Valor</p>
                      <p className="font-medium">{formatCurrency(record.value)}</p>
                    </div>
                  )}
                </div>
                
                {record.notes && (
                  <div>
                    <p className="text-gray-500">Observações</p>
                    <p className="mt-1">{record.notes}</p>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="flex gap-2">
          {record.status === 'received' && (
            <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-xs bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 hover:text-blue-700">
                  <Truck className="h-3.5 w-3.5 mr-1" />
                  Em Manutenção
                </Button>
              </DialogTrigger>
              <DialogContent>
                <h3 className="text-lg font-medium mb-4">Enviar para Manutenção</h3>
                <form onSubmit={(e) => { e.preventDefault(); handleSendToService(); }}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="dateSent">Data de Envio</Label>
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
          )}
          
          {record.status === 'sent' && (
            <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-xs bg-green-50 text-green-600 border-green-200 hover:bg-green-100 hover:text-green-700">
                  <CheckCircle className="h-3.5 w-3.5 mr-1" />
                  Concluído
                </Button>
              </DialogTrigger>
              <DialogContent>
                <h3 className="text-lg font-medium mb-4">Concluir Manutenção</h3>
                <form onSubmit={(e) => { e.preventDefault(); handleCompleteService(); }}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="dateReturned">Data de Retorno</Label>
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
          )}
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-xs text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700">
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                Excluir
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
                <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardFooter>
    </Card>
  );
};

export default MaintenanceCard;
