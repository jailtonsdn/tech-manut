
import { useState } from 'react';
import { format } from 'date-fns';
import { MaintenanceRecord } from '@/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import StatusBadge from './StatusBadge';
import MaintenanceForm from './MaintenanceForm';
import { Pencil, Trash2, Info } from 'lucide-react';
import { deleteMaintenanceRecord } from '@/data/maintenanceData';
import { useToast } from '@/hooks/use-toast';

interface MaintenanceCardProps {
  record: MaintenanceRecord;
  onUpdate: () => void;
}

const MaintenanceCard = ({ record, onUpdate }: MaintenanceCardProps) => {
  const { toast } = useToast();
  const [showEditDialog, setShowEditDialog] = useState(false);
  
  const handleDelete = () => {
    deleteMaintenanceRecord(record.id);
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
      
      <CardFooter className="flex justify-between pt-2 pb-4">
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
        
        <div className="flex gap-2">
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
