
import { useState, useEffect } from 'react';
import { getMaintenanceRecords } from '@/data/maintenanceData';
import { MaintenanceRecord } from '@/types';
import MaintenanceCard from '@/components/MaintenanceCard';
import MaintenanceTable from '@/components/MaintenanceTable';
import MaintenanceForm from '@/components/MaintenanceForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, SlidersHorizontal, CheckCircle, Truck, Clock } from 'lucide-react';
import Layout from '@/components/Layout';

const Index = () => {
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  // Filtros adicionais
  const [filterType, setFilterType] = useState<string | null>(null);
  const [filterBranch, setFilterBranch] = useState<string | null>(null);
  const [filterDepartment, setFilterDepartment] = useState<string | null>(null);

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    try {
      const allRecords = await getMaintenanceRecords();
      setRecords(allRecords);
    } catch (error) {
      console.error("Erro ao carregar registros:", error);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
  };

  const handleClearFilters = () => {
    setFilterType(null);
    setFilterBranch(null);
    setFilterDepartment(null);
    setShowFilterDialog(false);
  };

  const handleApplyFilters = () => {
    setShowFilterDialog(false);
  };

  // Função para filtrar os registros com base em todos os filtros
  const filteredRecords = records.filter(record => {
    // Filtro por texto de busca
    const matchesSearch = 
      record.equipmentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.assetTag?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (record.notes && record.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (record.branch && record.branch.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (record.department && record.department.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Filtro por status
    const matchesStatus = 
      activeFilter === 'all' ||
      (activeFilter === 'received' && record.status === 'received') ||
      (activeFilter === 'sent' && record.status === 'sent') ||
      (activeFilter === 'completed' && record.status === 'completed');
    
    // Filtros adicionais
    const matchesType = !filterType || record.equipmentType === filterType;
    const matchesBranch = !filterBranch || (record.branch && record.branch.toLowerCase().includes(filterBranch.toLowerCase()));
    const matchesDepartment = !filterDepartment || (record.department && record.department.toLowerCase().includes(filterDepartment.toLowerCase()));
    
    return matchesSearch && matchesStatus && matchesType && matchesBranch && matchesDepartment;
  });

  // Opções únicas para os filtros
  const typeOptions = [...new Set(records.map(r => r.equipmentType).filter(Boolean))];
  const branchOptions = [...new Set(records.filter(r => r.branch).map(r => r.branch as string))];
  const departmentOptions = [...new Set(records.filter(r => r.department).map(r => r.department as string))];

  return (
    <Layout activeFilter={activeFilter} onFilterChange={handleFilterChange}>
      <div className="flex flex-col gap-6 mb-10">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Equipamentos em Manutenção</h1>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Novo Equipamento
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] p-0">
              <MaintenanceForm onSubmit={() => {
                setShowAddDialog(false);
                loadRecords();
              }} />
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="flex-1 w-full md:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input 
                placeholder="Buscar equipamentos..." 
                value={searchQuery}
                onChange={handleSearch}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 items-center">
            <Button 
              variant={activeFilter === 'all' ? "default" : "outline"} 
              onClick={() => handleFilterChange('all')}
              size="sm"
            >
              Todos
            </Button>
            <Button 
              variant={activeFilter === 'received' ? "default" : "outline"} 
              onClick={() => handleFilterChange('received')}
              size="sm"
              className={activeFilter === 'received' ? "bg-orange-600 hover:bg-orange-700" : ""}
            >
              <Clock className="h-4 w-4 mr-1" />
              Lançados
            </Button>
            <Button 
              variant={activeFilter === 'sent' ? "default" : "outline"} 
              onClick={() => handleFilterChange('sent')}
              size="sm"
              className={activeFilter === 'sent' ? "bg-blue-600 hover:bg-blue-700" : ""}
            >
              <Truck className="h-4 w-4 mr-1" />
              Em Manutenção
            </Button>
            <Button 
              variant={activeFilter === 'completed' ? "default" : "outline"} 
              onClick={() => handleFilterChange('completed')}
              size="sm"
              className={activeFilter === 'completed' ? "bg-green-600 hover:bg-green-700" : ""}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Concluídos
            </Button>
            
            <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <SlidersHorizontal className="h-4 w-4 mr-1" />
                  Mais Filtros
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <h3 className="text-lg font-medium mb-4">Filtros Avançados</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Tipo de Equipamento</label>
                    <select
                      value={filterType || ''}
                      onChange={(e) => setFilterType(e.target.value || null)}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="">Todos</option>
                      {typeOptions.map(type => (
                        <option key={type} value={type}>
                          {type === 'ups' ? 'Nobreak' : type === 'printer' ? 'Impressora' : 'Computador'}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Filial</label>
                    <select
                      value={filterBranch || ''}
                      onChange={(e) => setFilterBranch(e.target.value || null)}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="">Todas</option>
                      {branchOptions.map(branch => (
                        <option key={branch} value={branch}>{branch}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Setor</label>
                    <select
                      value={filterDepartment || ''}
                      onChange={(e) => setFilterDepartment(e.target.value || null)}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="">Todos</option>
                      {departmentOptions.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex justify-end space-x-2 pt-2">
                    <Button variant="outline" onClick={handleClearFilters}>
                      Limpar
                    </Button>
                    <Button onClick={handleApplyFilters}>
                      Aplicar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            <div className="ml-auto">
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'grid' | 'list')}>
                <TabsList>
                  <TabsTrigger value="grid">Cards</TabsTrigger>
                  <TabsTrigger value="list">Tabela</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </div>
        
        <div className="mt-4">
          <Tabs value={viewMode} className="w-full">
            <TabsContent value="grid" className="mt-0">
              {filteredRecords.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                  <p className="text-gray-500">Nenhum registro encontrado com os filtros atuais.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredRecords.map(record => (
                    <MaintenanceCard 
                      key={record.id} 
                      record={record}
                      onUpdate={loadRecords}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="list" className="mt-0">
              <MaintenanceTable 
                records={filteredRecords}
                onUpdate={loadRecords}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
