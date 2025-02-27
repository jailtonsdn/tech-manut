
import { useState, useEffect } from 'react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MaintenanceRecord } from '@/types';
import { getMaintenanceRecords } from '@/data/maintenanceData';
import MaintenanceForm from '@/components/MaintenanceForm';
import MaintenanceTable from '@/components/MaintenanceTable';
import MaintenanceCard from '@/components/MaintenanceCard';
import Navbar from '@/components/Navbar';
import { Plus, Search, LayoutList, LayoutGrid } from 'lucide-react';

const Index = () => {
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<MaintenanceRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [view, setView] = useState<'list' | 'grid'>('list');
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeStatus, setActiveStatus] = useState('all');
  
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  // Load records from localStorage
  const loadRecords = () => {
    const allRecords = getMaintenanceRecords();
    setRecords(allRecords);
    
    // Apply any existing filters
    applyFilters(allRecords, searchQuery, activeFilter, activeStatus);
  };
  
  // Apply both search and type filters
  const applyFilters = (recordsToFilter: MaintenanceRecord[], query: string, filter: string, status: string) => {
    let result = [...recordsToFilter];
    
    // Apply equipment type filter
    if (filter !== 'all') {
      result = result.filter(record => record.equipmentType === filter);
    }
    
    // Apply status filter
    if (status !== 'all') {
      result = result.filter(record => record.status === status);
    }
    
    // Apply search query if present
    if (query.trim()) {
      const searchLower = query.toLowerCase();
      result = result.filter(record => 
        record.equipmentName.toLowerCase().includes(searchLower) ||
        record.assetTag.toLowerCase().includes(searchLower) ||
        (record.invoiceNumber && record.invoiceNumber.toLowerCase().includes(searchLower))
      );
    }
    
    setFilteredRecords(result);
  };
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    applyFilters(records, query, activeFilter, activeStatus);
  };
  
  // Handle filter change
  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    applyFilters(records, searchQuery, filter, activeStatus);
  };
  
  // Handle status filter change
  const handleStatusChange = (status: string) => {
    setActiveStatus(status);
    applyFilters(records, searchQuery, activeFilter, status);
  };
  
  // Initialize on component mount
  useEffect(() => {
    loadRecords();
    
    // Set view based on screen size
    if (isMobile) {
      setView('grid');
    }
  }, [isMobile]);
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar activeFilter={activeFilter} onFilterChange={handleFilterChange} />
      
      <main className="flex-1 container px-4 py-6 mx-auto">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="w-full sm:w-auto flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Pesquisar por nome, patrimônio ou NFE..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-10 bg-white"
              />
            </div>
            
            <div className="flex gap-2 w-full sm:w-auto">
              {!isMobile && (
                <div className="bg-white border rounded-md p-1 flex">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={view === 'list' ? 'bg-gray-100' : ''}
                    onClick={() => setView('list')}
                  >
                    <LayoutList className="h-4 w-4" />
                    <span className="sr-only">Lista</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={view === 'grid' ? 'bg-gray-100' : ''}
                    onClick={() => setView('grid')}
                  >
                    <LayoutGrid className="h-4 w-4" />
                    <span className="sr-only">Grid</span>
                  </Button>
                </div>
              )}
              
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black transition-all duration-300">
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Equipamento
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] p-0">
                  <MaintenanceForm 
                    onSubmit={() => {
                      setShowAddDialog(false);
                      loadRecords();
                    }} 
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border">
            <Tabs defaultValue="all" className="w-full" onValueChange={handleStatusChange}>
              <div className="px-4 pt-4">
                <TabsList className="grid grid-cols-4 w-full">
                  <TabsTrigger value="all">Todos</TabsTrigger>
                  <TabsTrigger value="received">Recebidos</TabsTrigger>
                  <TabsTrigger value="sent">Em Manutenção</TabsTrigger>
                  <TabsTrigger value="completed">Concluídos</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="all" className="p-4">
                {view === 'list' && !isMobile ? (
                  <MaintenanceTable records={filteredRecords} onUpdate={loadRecords} />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredRecords.length === 0 ? (
                      <div className="col-span-full flex items-center justify-center py-10 text-center">
                        <div className="max-w-sm">
                          <p className="text-gray-500">Nenhum equipamento encontrado.</p>
                          <Button 
                            variant="outline" 
                            className="mt-4"
                            onClick={() => setShowAddDialog(true)}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Adicionar equipamento
                          </Button>
                        </div>
                      </div>
                    ) : (
                      filteredRecords.map(record => (
                        <MaintenanceCard key={record.id} record={record} onUpdate={loadRecords} />
                      ))
                    )}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="received" className="p-4">
                {view === 'list' && !isMobile ? (
                  <MaintenanceTable records={filteredRecords} onUpdate={loadRecords} />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredRecords.length === 0 ? (
                      <div className="col-span-full flex items-center justify-center py-10 text-center">
                        <div className="max-w-sm">
                          <p className="text-gray-500">Nenhum equipamento com status "Recebido".</p>
                        </div>
                      </div>
                    ) : (
                      filteredRecords.map(record => (
                        <MaintenanceCard key={record.id} record={record} onUpdate={loadRecords} />
                      ))
                    )}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="sent" className="p-4">
                {view === 'list' && !isMobile ? (
                  <MaintenanceTable records={filteredRecords} onUpdate={loadRecords} />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredRecords.length === 0 ? (
                      <div className="col-span-full flex items-center justify-center py-10 text-center">
                        <div className="max-w-sm">
                          <p className="text-gray-500">Nenhum equipamento com status "Em Manutenção".</p>
                        </div>
                      </div>
                    ) : (
                      filteredRecords.map(record => (
                        <MaintenanceCard key={record.id} record={record} onUpdate={loadRecords} />
                      ))
                    )}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="completed" className="p-4">
                {view === 'list' && !isMobile ? (
                  <MaintenanceTable records={filteredRecords} onUpdate={loadRecords} />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredRecords.length === 0 ? (
                      <div className="col-span-full flex items-center justify-center py-10 text-center">
                        <div className="max-w-sm">
                          <p className="text-gray-500">Nenhum equipamento com status "Concluído".</p>
                        </div>
                      </div>
                    ) : (
                      filteredRecords.map(record => (
                        <MaintenanceCard key={record.id} record={record} onUpdate={loadRecords} />
                      ))
                    )}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      
      <footer className="py-4 border-t bg-white text-center text-sm text-gray-500">
        Sistema de Manutenção de TI &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default Index;
