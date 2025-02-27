
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { addMaintenanceRecord, updateMaintenanceRecord } from '@/data/maintenanceData';
import { MaintenanceRecord } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';

interface MaintenanceFormProps {
  existingRecord?: MaintenanceRecord;
  onSubmit?: () => void;
}

const MaintenanceForm = ({ existingRecord, onSubmit }: MaintenanceFormProps) => {
  const { toast } = useToast();
  const isEditing = !!existingRecord;
  
  const [formData, setFormData] = useState<Partial<MaintenanceRecord>>(
    existingRecord || {
      equipmentName: '',
      assetTag: '',
      dateReceived: format(new Date(), 'yyyy-MM-dd'),
      status: 'received', // Sempre começa como "Lançado"
      equipmentType: 'computer',
      branch: '',
      department: ''
    }
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isEditing && existingRecord) {
        updateMaintenanceRecord({
          ...existingRecord,
          ...formData as MaintenanceRecord
        });
        toast({
          title: "Registro atualizado",
          description: "As informações foram atualizadas com sucesso.",
        });
      } else {
        // Garante que novos registros sempre comecem com status "received" e data atual
        addMaintenanceRecord({
          ...formData as Omit<MaintenanceRecord, 'id'>,
          status: 'received',
          dateReceived: format(new Date(), 'yyyy-MM-dd')
        });
        toast({
          title: "Equipamento registrado",
          description: "O equipamento foi adicionado ao sistema.",
        });
        
        // Reset form for new entry
        setFormData({
          equipmentName: '',
          assetTag: '',
          dateReceived: format(new Date(), 'yyyy-MM-dd'),
          status: 'received',
          equipmentType: 'computer',
          branch: '',
          department: ''
        });
      }
      
      if (onSubmit) {
        onSubmit();
      }
    } catch (error) {
      console.error('Error saving record:', error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar as informações.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="w-full shadow-sm border border-gray-100">
      <CardHeader>
        <CardTitle className="text-xl font-medium">{isEditing ? 'Editar Registro' : 'Novo Equipamento'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="equipmentName">Nome do Equipamento</Label>
              <Input
                id="equipmentName"
                name="equipmentName"
                placeholder="Ex: Impressora HP LaserJet"
                value={formData.equipmentName}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="assetTag">Placa Patrimônio</Label>
              <Input
                id="assetTag"
                name="assetTag"
                placeholder="Ex: PAT-1234"
                value={formData.assetTag}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="branch">Filial</Label>
              <Input
                id="branch"
                name="branch"
                placeholder="Ex: Matriz, Filial 1, etc"
                value={formData.branch || ''}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="department">Setor</Label>
              <Input
                id="department"
                name="department"
                placeholder="Ex: Financeiro, RH, etc"
                value={formData.department || ''}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="equipmentType">Tipo de Equipamento</Label>
              <Select
                value={formData.equipmentType}
                onValueChange={(value) => handleSelectChange('equipmentType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ups">Nobreak</SelectItem>
                  <SelectItem value="printer">Impressora</SelectItem>
                  <SelectItem value="computer">Computador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Só mostra campos de status "sent" e "completed" na edição */}
            {isEditing && (
              <>
                {(formData.status === 'sent' || formData.status === 'completed') && (
                  <div className="space-y-2">
                    <Label htmlFor="dateSentToService">Data de Entrega</Label>
                    <Input
                      id="dateSentToService"
                      name="dateSentToService"
                      type="date"
                      value={formData.dateSentToService || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                )}
                
                {formData.status === 'completed' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="dateReturned">Data de Devolução</Label>
                      <Input
                        id="dateReturned"
                        name="dateReturned"
                        type="date"
                        value={formData.dateReturned || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="invoiceNumber">Número NFE</Label>
                      <Input
                        id="invoiceNumber"
                        name="invoiceNumber"
                        placeholder="Ex: NFE-5678"
                        value={formData.invoiceNumber || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="value">Valor (R$)</Label>
                      <Input
                        id="value"
                        name="value"
                        type="number"
                        step="0.01"
                        placeholder="0,00"
                        value={formData.value || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                  </>
                )}
              </>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Detalhes adicionais sobre o equipamento ou manutenção..."
              value={formData.notes || ''}
              onChange={handleInputChange}
              className="min-h-[100px]"
            />
          </div>
          
          <div className="flex justify-end">
            <Button type="submit" className="bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black transition-all duration-300">
              {isEditing ? 'Atualizar Registro' : 'Registrar Equipamento'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default MaintenanceForm;
