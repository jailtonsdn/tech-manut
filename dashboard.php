
<?php
// Arquivo para exibir o dashboard com estatísticas
session_start();
require_once 'config.php';

$titulo = "Dashboard";

// Configurar período de análise
$periodo = isset($_GET['periodo']) ? $_GET['periodo'] : '3m'; // Padrão: 3 meses
$data_inicio = date('Y-m-d', strtotime('-3 months'));
$data_fim = date('Y-m-d');

switch ($periodo) {
    case '1m':
        $data_inicio = date('Y-m-d', strtotime('-1 month'));
        break;
    case '6m':
        $data_inicio = date('Y-m-d', strtotime('-6 months'));
        break;
    case '1y':
        $data_inicio = date('Y-m-d', strtotime('-1 year'));
        break;
    case 'custom':
        $data_inicio = isset($_GET['data_inicio']) ? $_GET['data_inicio'] : $data_inicio;
        $data_fim = isset($_GET['data_fim']) ? $_GET['data_fim'] : $data_fim;
        break;
}

// Filtros adicionais
$filial = isset($_GET['filial']) ? $_GET['filial'] : '';
$setor = isset($_GET['setor']) ? $_GET['setor'] : '';

try {
    $conn = new PDO("mysql:host=$hostname;dbname=$database", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Contagem total de equipamentos por status
    $sql_status = "
        SELECT 
            status, 
            COUNT(*) as quantidade 
        FROM equipamentos 
        WHERE excluido = 'N'
        GROUP BY status
    ";
    $stmt_status = $conn->query($sql_status);
    $contagem_status = $stmt_status->fetchAll(PDO::FETCH_ASSOC);
    
    // Formatação dos dados de status para exibição
    $status_data = [
        'received' => 0,
        'sent' => 0,
        'completed' => 0
    ];
    
    foreach ($contagem_status as $status) {
        if (isset($status_data[$status['status']])) {
            $status_data[$status['status']] = $status['quantidade'];
        }
    }
    
    // Estatísticas de manutenções concluídas no período
    $sql_concluidas = "
        SELECT 
            COUNT(*) as total,
            COALESCE(SUM(valor), 0) as valor_total
        FROM equipamentos 
        WHERE 
            status = 'completed' 
            AND data_devolucao BETWEEN :data_inicio AND :data_fim
            AND excluido = 'N'
    ";
    
    $params = [
        ':data_inicio' => $data_inicio,
        ':data_fim' => $data_fim
    ];
    
    // Adicionar filtros de filial e setor, se fornecidos
    if (!empty($filial)) {
        $sql_concluidas .= " AND filial = :filial";
        $params[':filial'] = $filial;
    }
    
    if (!empty($setor)) {
        $sql_concluidas .= " AND setor LIKE :setor";
        $params[':setor'] = "%$setor%";
    }
    
    $stmt_concluidas = $conn->prepare($sql_concluidas);
    foreach ($params as $key => $value) {
        $stmt_concluidas->bindValue($key, $value);
    }
    $stmt_concluidas->execute();
    $estatisticas = $stmt_concluidas->fetch(PDO::FETCH_ASSOC);
    
    // Dados para gráfico por mês
    $sql_por_mes = "
        SELECT 
            DATE_FORMAT(data_devolucao, '%Y-%m') as mes,
            COUNT(*) as quantidade,
            COALESCE(SUM(valor), 0) as valor_total
        FROM equipamentos 
        WHERE 
            status = 'completed' 
            AND data_devolucao BETWEEN :data_inicio AND :data_fim
            AND excluido = 'N'
    ";
    
    // Adicionar os mesmos filtros
    if (!empty($filial)) {
        $sql_por_mes .= " AND filial = :filial";
    }
    
    if (!empty($setor)) {
        $sql_por_mes .= " AND setor LIKE :setor";
    }
    
    $sql_por_mes .= " GROUP BY DATE_FORMAT(data_devolucao, '%Y-%m') ORDER BY mes";
    
    $stmt_por_mes = $conn->prepare($sql_por_mes);
    foreach ($params as $key => $value) {
        $stmt_por_mes->bindValue($key, $value);
    }
    $stmt_por_mes->execute();
    $dados_por_mes = $stmt_por_mes->fetchAll(PDO::FETCH_ASSOC);
    
    // Obter lista de filiais para filtro
    $stmt_filiais = $conn->query("SELECT DISTINCT filial FROM equipamentos WHERE excluido = 'N' ORDER BY filial");
    $filiais = $stmt_filiais->fetchAll(PDO::FETCH_COLUMN);
    
    // Obter lista de setores para filtro
    $stmt_setores = $conn->query("SELECT DISTINCT setor FROM equipamentos WHERE setor IS NOT NULL AND setor != '' AND excluido = 'N' ORDER BY setor");
    $setores = $stmt_setores->fetchAll(PDO::FETCH_COLUMN);
    
} catch(PDOException $e) {
    $_SESSION['mensagem'] = "Erro ao conectar com o banco de dados: " . $e->getMessage();
    $_SESSION['tipo_mensagem'] = "danger";
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $titulo; ?> - Sistema de Manutenção</title>
    <!-- Bootstrap para estilização -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- FontAwesome para ícones -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">
    <!-- Chart.js para gráficos -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        .card-dashboard {
            transition: all 0.3s;
        }
        .card-dashboard:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        }
        .chart-container {
            position: relative;
            height: 300px;
            width: 100%;
        }
    </style>
</head>
<body>
    <div class="container-fluid">
        <div class="row">
            <!-- Sidebar -->
            <div class="col-md-3 col-lg-2 d-md-block bg-light sidebar collapse" style="min-height: 100vh;">
                <div class="position-sticky pt-3">
                    <ul class="nav flex-column">
                        <li class="nav-item">
                            <a class="nav-link" href="index.php">
                                <i class="fas fa-tools me-2"></i>
                                Equipamentos
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link active" href="dashboard.php">
                                <i class="fas fa-chart-bar me-2"></i>
                                Dashboard
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="invoices.php">
                                <i class="fas fa-file-invoice me-2"></i>
                                Notas Fiscais
                            </a>
                        </li>
                    </ul>
                </div>
            </div>

            <!-- Conteúdo principal -->
            <main class="col-md-9 ms-sm-auto col-lg-10 px-md-4">
                <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                    <h1 class="h2"><?php echo $titulo; ?></h1>
                    <div class="btn-toolbar mb-2 mb-md-0">
                        <div class="btn-group me-2">
                            <button type="button" class="btn btn-sm btn-outline-secondary" onclick="window.print()">
                                <i class="fas fa-print me-1"></i> Imprimir
                            </button>
                        </div>
                        <button type="button" class="btn btn-sm btn-outline-secondary dropdown-toggle" data-bs-toggle="collapse" data-bs-target="#collapseFilters">
                            <i class="fas fa-filter me-1"></i> Filtros
                        </button>
                    </div>
                </div>

                <!-- Filtros -->
                <div class="collapse mb-4" id="collapseFilters">
                    <div class="card card-body">
                        <form method="GET" class="row g-3">
                            <div class="col-md-4">
                                <label for="periodo" class="form-label">Período</label>
                                <select class="form-select" id="periodo" name="periodo" onchange="toggleCustomDates(this.value)">
                                    <option value="1m" <?php echo $periodo === '1m' ? 'selected' : ''; ?>>Último mês</option>
                                    <option value="3m" <?php echo $periodo === '3m' ? 'selected' : ''; ?>>Últimos 3 meses</option>
                                    <option value="6m" <?php echo $periodo === '6m' ? 'selected' : ''; ?>>Últimos 6 meses</option>
                                    <option value="1y" <?php echo $periodo === '1y' ? 'selected' : ''; ?>>Último ano</option>
                                    <option value="custom" <?php echo $periodo === 'custom' ? 'selected' : ''; ?>>Período personalizado</option>
                                </select>
                            </div>
                            <div class="col-md-4" id="dataInicio" style="display: <?php echo $periodo === 'custom' ? 'block' : 'none'; ?>">
                                <label for="data_inicio" class="form-label">Data Inicial</label>
                                <input type="date" class="form-control" id="data_inicio" name="data_inicio" value="<?php echo $data_inicio; ?>">
                            </div>
                            <div class="col-md-4" id="dataFim" style="display: <?php echo $periodo === 'custom' ? 'block' : 'none'; ?>">
                                <label for="data_fim" class="form-label">Data Final</label>
                                <input type="date" class="form-control" id="data_fim" name="data_fim" value="<?php echo $data_fim; ?>">
                            </div>
                            <div class="col-md-4">
                                <label for="filial" class="form-label">Filial</label>
                                <select class="form-select" id="filial" name="filial">
                                    <option value="">Todas</option>
                                    <?php foreach ($filiais as $f): ?>
                                    <option value="<?php echo $f; ?>" <?php echo $filial === $f ? 'selected' : ''; ?>><?php echo $f; ?></option>
                                    <?php endforeach; ?>
                                </select>
                            </div>
                            <div class="col-md-4">
                                <label for="setor" class="form-label">Setor</label>
                                <select class="form-select" id="setor" name="setor">
                                    <option value="">Todos</option>
                                    <?php foreach ($setores as $s): ?>
                                    <option value="<?php echo $s; ?>" <?php echo $setor === $s ? 'selected' : ''; ?>><?php echo $s; ?></option>
                                    <?php endforeach; ?>
                                </select>
                            </div>
                            <div class="col-12">
                                <button type="submit" class="btn btn-primary">Aplicar Filtros</button>
                                <a href="dashboard.php" class="btn btn-outline-secondary">Limpar Filtros</a>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- Cards de resumo -->
                <div class="row mb-4">
                    <div class="col-md-3">
                        <div class="card card-dashboard bg-warning bg-opacity-10 border-warning">
                            <div class="card-body">
                                <div class="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 class="card-title text-muted mb-0">Lançados</h6>
                                        <h2 class="my-2"><?php echo $status_data['received']; ?></h2>
                                        <p class="card-text mb-0">Equipamentos</p>
                                    </div>
                                    <div class="fs-1 text-warning opacity-75">
                                        <i class="fas fa-clock"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card card-dashboard bg-primary bg-opacity-10 border-primary">
                            <div class="card-body">
                                <div class="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 class="card-title text-muted mb-0">Em Manutenção</h6>
                                        <h2 class="my-2"><?php echo $status_data['sent']; ?></h2>
                                        <p class="card-text mb-0">Equipamentos</p>
                                    </div>
                                    <div class="fs-1 text-primary opacity-75">
                                        <i class="fas fa-truck"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card card-dashboard bg-success bg-opacity-10 border-success">
                            <div class="card-body">
                                <div class="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 class="card-title text-muted mb-0">Concluídos</h6>
                                        <h2 class="my-2"><?php echo $status_data['completed']; ?></h2>
                                        <p class="card-text mb-0">Equipamentos</p>
                                    </div>
                                    <div class="fs-1 text-success opacity-75">
                                        <i class="fas fa-check-circle"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card card-dashboard bg-info bg-opacity-10 border-info">
                            <div class="card-body">
                                <div class="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 class="card-title text-muted mb-0">Gasto Total</h6>
                                        <h2 class="my-2"><?php echo formataMoeda($estatisticas['valor_total'] ?? 0); ?></h2>
                                        <p class="card-text mb-0">No período</p>
                                    </div>
                                    <div class="fs-1 text-info opacity-75">
                                        <i class="fas fa-dollar-sign"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Gráficos -->
                <div class="row mb-4">
                    <div class="col-md-8">
                        <div class="card mb-4">
                            <div class="card-header">
                                <h5 class="card-title mb-0">Gastos por Mês</h5>
                            </div>
                            <div class="card-body">
                                <div class="chart-container">
                                    <canvas id="gastosChart"></canvas>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card">
                            <div class="card-header">
                                <h5 class="card-title mb-0">Status dos Equipamentos</h5>
                            </div>
                            <div class="card-body">
                                <div class="chart-container">
                                    <canvas id="statusChart"></canvas>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Estatísticas do Período -->
                <div class="card mb-4">
                    <div class="card-header">
                        <h5 class="card-title mb-0">Estatísticas do Período (<?php echo date('d/m/Y', strtotime($data_inicio)); ?> a <?php echo date('d/m/Y', strtotime($data_fim)); ?>)</h5>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-6">
                                <p><strong>Total de manutenções concluídas:</strong> <?php echo $estatisticas['total'] ?? 0; ?></p>
                                <p><strong>Valor total gasto:</strong> <?php echo formataMoeda($estatisticas['valor_total'] ?? 0); ?></p>
                                <p><strong>Média por manutenção:</strong> 
                                    <?php 
                                    $media = ($estatisticas['total'] > 0) ? $estatisticas['valor_total'] / $estatisticas['total'] : 0;
                                    echo formataMoeda($media); 
                                    ?>
                                </p>
                            </div>
                            <div class="col-md-6">
                                <?php if (!empty($filial)): ?>
                                <p><strong>Filial:</strong> <?php echo $filial; ?></p>
                                <?php endif; ?>
                                <?php if (!empty($setor)): ?>
                                <p><strong>Setor:</strong> <?php echo $setor; ?></p>
                                <?php endif; ?>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    </div>

    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    
    <script>
        // Função para mostrar/esconder campos de datas personalizadas
        function toggleCustomDates(value) {
            const dataInicio = document.getElementById('dataInicio');
            const dataFim = document.getElementById('dataFim');
            
            if (value === 'custom') {
                dataInicio.style.display = 'block';
                dataFim.style.display = 'block';
            } else {
                dataInicio.style.display = 'none';
                dataFim.style.display = 'none';
            }
        }
        
        // Carregar gráficos quando a página carregar
        document.addEventListener('DOMContentLoaded', function() {
            // Dados para o gráfico de status
            const statusData = {
                labels: ['Lançados', 'Em Manutenção', 'Concluídos'],
                datasets: [{
                    data: [
                        <?php echo $status_data['received']; ?>,
                        <?php echo $status_data['sent']; ?>,
                        <?php echo $status_data['completed']; ?>
                    ],
                    backgroundColor: ['#f8d7a4', '#90caf9', '#a5d6a7'],
                    borderColor: ['#f0ad4e', '#2196f3', '#4caf50'],
                    borderWidth: 1
                }]
            };
            
            // Configuração do gráfico de status
            const statusConfig = {
                type: 'pie',
                data: statusData,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            };
            
            // Renderizar gráfico de status
            const statusChart = new Chart(
                document.getElementById('statusChart'),
                statusConfig
            );
            
            // Dados para o gráfico de gastos por mês
            const gastosData = {
                labels: [
                    <?php 
                    foreach ($dados_por_mes as $data) {
                        $mes_ano = explode('-', $data['mes']);
                        $mes = $mes_ano[1];
                        $ano = $mes_ano[0];
                        echo "'" . $mes . "/" . $ano . "',";
                    }
                    ?>
                ],
                datasets: [{
                    label: 'Valor Gasto (R$)',
                    data: [
                        <?php 
                        foreach ($dados_por_mes as $data) {
                            echo $data['valor_total'] . ',';
                        }
                        ?>
                    ],
                    backgroundColor: '#2196f3',
                    borderColor: '#1976d2',
                    borderWidth: 1
                }]
            };
            
            // Configuração do gráfico de gastos
            const gastosConfig = {
                type: 'bar',
                data: gastosData,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return 'R$ ' + value.toFixed(2).replace('.', ',');
                                }
                            }
                        }
                    }
                }
            };
            
            // Renderizar gráfico de gastos
            const gastosChart = new Chart(
                document.getElementById('gastosChart'),
                gastosConfig
            );
        });
    </script>
</body>
</html>
