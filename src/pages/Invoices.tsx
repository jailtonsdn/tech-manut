
import { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { getMaintenanceRecords } from '@/data/maintenanceData';
import { MaintenanceRecord } from '@/types';
import { Plus, Filter, Trash2 } from 'lucide-react';

interface InvoiceItem {
  id: string;
  equipmentId: string;
  equipmentName: string;
  branch?: string;
  department?: string;
  value: number;
}

interface Invoice {
  id: string;
  number: string;
  date: string;
  totalValue: number;
  items: InvoiceItem[];
  createdBy: string;
}

// Mock de dados para notas fiscais
const generateMockInvoices = (records: MaintenanceRecord[]): Invoice[] => {
  const completedRecords = records.filter(r => r.status === 'completed' && r.invoiceNumber);
  const invoiceMap: Record<string, Invoice> = {};

  completedRecords.forEach(record => {
    if (!record.invoiceNumber || !record.value || !record.dateReturned) return;
    
    if (!invoiceMap[record.invoiceNumber]) {
      invoiceMap[record.invoiceNumber] = {
        id: `inv-${Math.random().toString(36).substring(2, 9)}`,
        number: record.invoiceNumber,
        date: record.dateReturned,
        totalValue: record.value,
        items: [{
          id: `item-${Math.random().toString(36).substring(2, 9)}`,
          equipmentId: record.id.toString(),
          equipmentName: record.equipmentName || '',
          branch: record.branch,
          department: record.department,
          value: record.value
        }],
        createdBy: record.registeredBy || 'Sistema'
      };
    } else {
      invoiceMap[record.invoiceNumber].totalValue += record.value;
      invoiceMap[record.invoiceNumber].items.push({
        id: `item-${Math.random().toString(36).substring(2, 9)}`,
        equipmentId: record.id.toString(),
        equipmentName: record.equipmentName || '',
        branch: record.branch,
        department: record.department,
        value: record.value
      });
    }
  });

  return Object.values(invoiceMap);
};

const Invoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showAddInvoiceDialog, setShowAddInvoiceDialog] = useState(false);
  const [showAddItemDialog, setShowAddItemDialog] = useState(false);
  const [filterBranch, setFilterBranch] = useState<string>('');
  const [filterDepartment, setFilterDepartment] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [newInvoice, setNewInvoice] = useState({
    number: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    items: [] as InvoiceItem[]
  });
  
  const [newItem, setNewItem] = useState({
    equipmentId: '',
    equipmentName: '',
    branch: '',
    department: '',
    value: 0
  });
  
  const { toast } = useToast();
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  
  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const records = await getMaintenanceRecords();
        setMaintenanceRecords(records);
        setInvoices(generateMockInvoices(records));
      } catch (error) {
        console.error("Erro ao buscar registros:", error);
      }
    };
    
    fetchRecords();
  }, []);

  // Opções de filtro baseadas nos dados disponíveis
  const branchOptions = useMemo(() => {
    const branches = new Set<string>();
    invoices.forEach(invoice => {
      invoice.items.forEach(item => {
        if (item.branch) branches.add(item.branch);
      });
    });
    return Array.from(branches);
  }, [invoices]);

  const departmentOptions = useMemo(() => {
    const departments = new Set<string>();
    invoices.forEach(invoice => {
      invoice.items.forEach(item => {
        if (item.department) departments.add(item.department);
      });
    });
    return Array.from(departments);
  }, [invoices]);

  // Filtrar notas fiscais
  const filteredInvoices = useMemo(() => {
    return invoices.filter(invoice => {
      // Filtrar por número da nota ou equipamento
      const matchesSearch = 
        invoice.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.items.some(item => 
          item.equipmentName.toLowerCase().includes(searchQuery.toLowerCase())
        );
      
      // Filtrar por filial
      const matchesBranch = !filterBranch || 
        invoice.items.some(item => item.branch === filterBranch);
      
      // Filtrar por departamento
      const matchesDepartment = !filterDepartment || 
        invoice.items.some(item => item.department === filterDepartment);
      
      return matchesSearch && matchesBranch && matchesDepartment;
    });
  }, [invoices, searchQuery, filterBranch, filterDepartment]);

  const handleAddInvoice = () => {
    if (!newInvoice.number || !newInvoice.date || newInvoice.items.length === 0) {
      toast({
        title: "Erro ao adicionar nota fiscal",
        description: "Preencha todos os campos e adicione pelo menos um item.",
        variant: "destructive"
      });
      return;
    }

    const totalValue = newInvoice.items.reduce((sum, item) => sum + item.value, 0);
    
    const invoice: Invoice = {
      id: `inv-${Math.random().toString(36).substring(2, 9)}`,
      number: newInvoice.number,
      date: newInvoice.date,
      totalValue,
      items: newInvoice.items,
      createdBy: 'Usuário atual' // Em uma implementação real, seria o usuário logado
    };
    
    setInvoices(prev => [...prev, invoice]);
    setNewInvoice({
      number: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      items: []
    });
    setShowAddInvoiceDialog(false);
    
    toast({
      title: "Nota fiscal adicionada",
      description: `Nota fiscal ${invoice.number} adicionada com sucesso.`
    });
  };

  const handleAddItem = () => {
    if (!newItem.equipmentName || newItem.value <= 0) {
      toast({
        title: "Erro ao adicionar item",
        description: "Preencha o nome do equipamento e um valor válido.",
        variant: "destructive"
      });
      return;
    }
    
    const item: InvoiceItem = {
      id: `item-${Math.random().toString(36).substring(2, 9)}`,
      equipmentId: newItem.equipmentId || `eq-${Math.random().toString(36).substring(2, 9)}`,
      equipmentName: newItem.equipmentName,
      branch: newItem.branch,
      department: newItem.department,
      value: newItem.value
    };
    
    setNewInvoice(prev => ({
      ...prev,
      items: [...prev.items, item]
    }));
    
    setNewItem({
      equipmentId: '',
      equipmentName: '',
      branch: '',
      department: '',
      value: 0
    });
    
    setShowAddItemDialog(false);
  };

  const handleRemoveItem = (itemId: string) => {
    setNewInvoice(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Notas Fiscais</h1>
          <Dialog open={showAddInvoiceDialog} onOpenChange={setShowAddInvoiceDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Nota Fiscal
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Adicionar Nota Fiscal</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="invoiceNumber">Número da Nota</Label>
                    <Input
                      id="invoiceNumber"
                      value={newInvoice.number}
                      onChange={(e) => setNewInvoice(prev => ({ ...prev, number: e.target.value }))}
                      placeholder="Ex: NFE-1234"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="invoiceDate">Data da Nota</Label>
                    <Input
                      id="invoiceDate"
                      type="date"
                      value={newInvoice.date}
                      onChange={(e) => setNewInvoice(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Itens da Nota</Label>
                    <Dialog open={showAddItemDialog} onOpenChange={setShowAddItemDialog}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <Plus className="h-3 w-3 mr-1" />
                          Adicionar Item
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Adicionar Item</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="equipmentName">Nome do Equipamento</Label>
                            <Input
                              id="equipmentName"
                              value={newItem.equipmentName}
                              onChange={(e) => setNewItem(prev => ({ ...prev, equipmentName: e.target.value }))}
                              placeholder="Ex: Computador Dell XPS"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="branch">Filial</Label>
                            <Input
                              id="branch"
                              value={newItem.branch}
                              onChange={(e) => setNewItem(prev => ({ ...prev, branch: e.target.value }))}
                              placeholder="Ex: Matriz"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="department">Setor</Label>
                            <Input
                              id="department"
                              value={newItem.department}
                              onChange={(e) => setNewItem(prev => ({ ...prev, department: e.target.value }))}
                              placeholder="Ex: Financeiro"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="value">Valor (R$)</Label>
                            <Input
                              id="value"
                              type="number"
                              step="0.01"
                              value={newItem.value}
                              onChange={(e) => setNewItem(prev => ({ ...prev, value: parseFloat(e.target.value) }))}
                              placeholder="0,00"
                            />
                          </div>
                          <div className="flex justify-end space-x-2 pt-2">
                            <Button variant="outline" onClick={() => setShowAddItemDialog(false)}>
                              Cancelar
                            </Button>
                            <Button onClick={handleAddItem}>
                              Adicionar
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  
                  {newInvoice.items.length === 0 ? (
                    <div className="text-center py-4 bg-gray-50 rounded-md border border-dashed border-gray-200">
                      <p className="text-gray-500">Nenhum item adicionado. Clique em "Adicionar Item" para começar.</p>
                    </div>
                  ) : (
                    <div className="border rounded-md">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Equipamento</TableHead>
                            <TableHead>Filial</TableHead>
                            <TableHead>Setor</TableHead>
                            <TableHead>Valor</TableHead>
                            <TableHead></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {newInvoice.items.map(item => (
                            <TableRow key={item.id}>
                              <TableCell>{item.equipmentName}</TableCell>
                              <TableCell>{item.branch || '-'}</TableCell>
                              <TableCell>{item.department || '-'}</TableCell>
                              <TableCell>{formatCurrency(item.value)}</TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveItem(item.id)}
                                  className="h-8 w-8 p-0 text-red-500"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                          <TableRow>
                            <TableCell colSpan={3} className="text-right font-medium">
                              Total:
                            </TableCell>
                            <TableCell className="font-bold">
                              {formatCurrency(newInvoice.items.reduce((sum, item) => sum + item.value, 0))}
                            </TableCell>
                            <TableCell></TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setShowAddInvoiceDialog(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleAddInvoice}>
                    Salvar Nota Fiscal
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Buscar</Label>
                <Input
                  id="search"
                  placeholder="Número da nota ou equipamento"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="filterBranch">Filial</Label>
                <Select value={filterBranch} onValueChange={setFilterBranch}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as filiais" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas as filiais</SelectItem>
                    {branchOptions.map(branch => (
                      <SelectItem key={branch} value={branch}>{branch}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="filterDepartment">Setor</Label>
                <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os setores" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos os setores</SelectItem>
                    {departmentOptions.map(dept => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Lista de Notas Fiscais */}
        <Card>
          <CardHeader>
            <CardTitle>Notas Fiscais</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredInvoices.length === 0 ? (
              <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                <p className="text-gray-500">Nenhuma nota fiscal encontrada com os filtros atuais.</p>
              </div>
            ) : (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Número</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Valor Total</TableHead>
                      <TableHead>Qtd. Itens</TableHead>
                      <TableHead>Registrado por</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.map(invoice => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">{invoice.number}</TableCell>
                        <TableCell>{format(new Date(invoice.date), 'dd/MM/yyyy')}</TableCell>
                        <TableCell>{formatCurrency(invoice.totalValue)}</TableCell>
                        <TableCell>{invoice.items.length}</TableCell>
                        <TableCell>{invoice.createdBy}</TableCell>
                        <TableCell className="text-right">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => setSelectedInvoice(invoice)}>
                                Detalhes
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[700px]">
                              <DialogHeader>
                                <DialogTitle>Detalhes da Nota Fiscal</DialogTitle>
                              </DialogHeader>
                              {selectedInvoice && (
                                <div className="space-y-4 py-2">
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                      <p className="text-sm text-gray-500">Número da Nota</p>
                                      <p className="font-medium">{selectedInvoice.number}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-500">Data</p>
                                      <p className="font-medium">{format(new Date(selectedInvoice.date), 'dd/MM/yyyy')}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-500">Valor Total</p>
                                      <p className="font-medium">{formatCurrency(selectedInvoice.totalValue)}</p>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <h3 className="text-sm font-medium mb-2">Itens da Nota</h3>
                                    <div className="border rounded-md">
                                      <Table>
                                        <TableHeader>
                                          <TableRow>
                                            <TableHead>Equipamento</TableHead>
                                            <TableHead>Filial</TableHead>
                                            <TableHead>Setor</TableHead>
                                            <TableHead>Valor</TableHead>
                                            <TableHead>% do Total</TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {selectedInvoice.items.map(item => (
                                            <TableRow key={item.id}>
                                              <TableCell>{item.equipmentName}</TableCell>
                                              <TableCell>{item.branch || '-'}</TableCell>
                                              <TableCell>{item.department || '-'}</TableCell>
                                              <TableCell>{formatCurrency(item.value)}</TableCell>
                                              <TableCell>
                                                {((item.value / selectedInvoice.totalValue) * 100).toFixed(2)}%
                                              </TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Invoices;
