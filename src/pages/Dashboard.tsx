
import { useState, useMemo } from 'react';
import { format, isWithinInterval, parse, addMonths, startOfMonth, endOfMonth } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getMaintenanceRecords } from '@/data/maintenanceData';
import { MaintenanceRecord } from '@/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Layout from '@/components/Layout';

const Dashboard = () => {
  const [dateRange, setDateRange] = useState<'1m' | '3m' | '6m' | '1y' | 'custom'>('3m');
  const [startDate, setStartDate] = useState<string>(format(startOfMonth(addMonths(new Date(), -3)), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState<string>(format(endOfMonth(new Date()), 'yyyy-MM-dd'));

  // Cores para o gráfico de pizza
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  // Obtém todos os registros
  const allRecords = getMaintenanceRecords();
  
  // Filtra registros concluídos com valor
  const completedRecords = allRecords.filter(
    record => record.status === 'completed' && record.value !== undefined
  );

  // Atualiza o intervalo de datas com base na seleção
  const handleDateRangeChange = (value: string) => {
    const today = new Date();
    let start;
    let end = endOfMonth(today);

    switch (value as '1m' | '3m' | '6m' | '1y' | 'custom') {
      case '1m':
        start = startOfMonth(addMonths(today, -1));
        break;
      case '3m':
        start = startOfMonth(addMonths(today, -3));
        break;
      case '6m':
        start = startOfMonth(addMonths(today, -6));
        break;
      case '1y':
        start = startOfMonth(addMonths(today, -12));
        break;
      case 'custom':
        return setDateRange('custom');
      default:
        start = startOfMonth(addMonths(today, -3));
    }

    setStartDate(format(start, 'yyyy-MM-dd'));
    setEndDate(format(end, 'yyyy-MM-dd'));
    setDateRange(value as '1m' | '3m' | '6m' | '1y' | 'custom');
  };

  // Filtra registros dentro do intervalo de datas selecionado
  const filteredRecords = useMemo(() => {
    return completedRecords.filter(record => {
      if (!record.dateReturned) return false;
      
      const recordDate = new Date(record.dateReturned);
      const start = parse(startDate, 'yyyy-MM-dd', new Date());
      const end = parse(endDate, 'yyyy-MM-dd', new Date());
      
      return isWithinInterval(recordDate, { start, end });
    });
  }, [completedRecords, startDate, endDate]);

  // Calcula o custo total
  const totalCost = useMemo(() => {
    return filteredRecords.reduce((sum, record) => sum + (record.value || 0), 0);
  }, [filteredRecords]);

  // Prepara dados para o gráfico por tipo de equipamento
  const costByEquipmentType = useMemo(() => {
    const costs: Record<string, number> = {};
    
    filteredRecords.forEach(record => {
      const type = record.equipmentType;
      costs[type] = (costs[type] || 0) + (record.value || 0);
    });
    
    return Object.entries(costs).map(([type, value]) => ({
      name: type === 'ups' ? 'Nobreak' : type === 'printer' ? 'Impressora' : 'Computador',
      value
    }));
  }, [filteredRecords]);

  // Prepara dados para o gráfico por mês
  const costByMonth = useMemo(() => {
    const costs: Record<string, number> = {};
    
    filteredRecords.forEach(record => {
      if (!record.dateReturned) return;
      
      const month = format(new Date(record.dateReturned), 'MM/yyyy');
      costs[month] = (costs[month] || 0) + (record.value || 0);
    });
    
    return Object.entries(costs).map(([month, value]) => ({
      month,
      value
    }));
  }, [filteredRecords]);

  // Função para formatar valores em reais
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold mb-4">Dashboard de Manutenção</h1>
        
        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="dateRange">Período</Label>
                <Select value={dateRange} onValueChange={handleDateRangeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1m">Último mês</SelectItem>
                    <SelectItem value="3m">Últimos 3 meses</SelectItem>
                    <SelectItem value="6m">Últimos 6 meses</SelectItem>
                    <SelectItem value="1y">Último ano</SelectItem>
                    <SelectItem value="custom">Personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="startDate">Data inicial</Label>
                <Input 
                  id="startDate" 
                  type="date" 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)}
                  disabled={dateRange !== 'custom'}
                />
              </div>
              
              <div>
                <Label htmlFor="endDate">Data final</Label>
                <Input 
                  id="endDate" 
                  type="date" 
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)}
                  disabled={dateRange !== 'custom'}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total de Manutenções</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredRecords.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Custo Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalCost)}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Média por Manutenção</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {filteredRecords.length > 0 
                  ? formatCurrency(totalCost / filteredRecords.length) 
                  : formatCurrency(0)}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Gráficos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Gráfico de custos por tipo de equipamento */}
          <Card>
            <CardHeader>
              <CardTitle>Custo por Tipo de Equipamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={costByEquipmentType}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {costByEquipmentType.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          {/* Gráfico de custos por mês */}
          <Card>
            <CardHeader>
              <CardTitle>Custo por Mês</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={costByMonth}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Legend />
                    <Bar dataKey="value" name="Valor" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
