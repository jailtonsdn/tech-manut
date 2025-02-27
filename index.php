
<?php
// Arquivo principal que exibirá a lista de equipamentos
session_start();
$page_title = "Equipamentos em Manutenção";
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sistema de Manutenção</title>
    <!-- Bootstrap para estilização -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- FontAwesome para ícones -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">
    <style>
        .status-badge {
            padding: 0.25rem 0.5rem;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
        }
        .status-received {
            background-color: #fff3cd;
            color: #856404;
            border: 1px solid #ffeeba;
        }
        .status-sent {
            background-color: #cce5ff;
            color: #004085;
            border: 1px solid #b8daff;
        }
        .status-completed {
            background-color: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        .card {
            transition: all 0.3s;
        }
        .card:hover {
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
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
                            <a class="nav-link active" href="index.php">
                                <i class="fas fa-tools me-2"></i>
                                Equipamentos
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="dashboard.php">
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
                    
                    <h6 class="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-4 mb-1 text-muted">
                        <span>Filtros Rápidos</span>
                    </h6>
                    <ul class="nav flex-column mb-2">
                        <li class="nav-item">
                            <a class="nav-link" href="index.php">
                                Todos
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="index.php?status=received">
                                <span class="status-badge status-received">Lançados</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="index.php?status=sent">
                                <span class="status-badge status-sent">Em Manutenção</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="index.php?status=completed">
                                <span class="status-badge status-completed">Concluídos</span>
                            </a>
                        </li>
                    </ul>
                </div>
            </div>

            <!-- Conteúdo principal -->
            <main class="col-md-9 ms-sm-auto col-lg-10 px-md-4">
                <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                    <h1 class="h2"><?php echo $page_title; ?></h1>
                    <div class="btn-toolbar mb-2 mb-md-0">
                        <a href="form.php" class="btn btn-primary">
                            <i class="fas fa-plus me-1"></i> Novo Equipamento
                        </a>
                    </div>
                </div>

                <!-- Barra de pesquisa e filtros -->
                <div class="row mb-4">
                    <div class="col-md-6">
                        <form method="GET">
                            <div class="input-group">
                                <span class="input-group-text"><i class="fas fa-search"></i></span>
                                <input type="text" class="form-control" name="search" placeholder="Buscar equipamentos..." 
                                       value="<?php echo isset($_GET['search']) ? htmlspecialchars($_GET['search']) : ''; ?>">
                                <button class="btn btn-outline-secondary" type="submit">Buscar</button>
                            </div>
                        </form>
                    </div>
                    <div class="col-md-6 d-flex justify-content-end">
                        <div class="btn-group" role="group">
                            <a href="index.php?view=grid<?php echo isset($_GET['status']) ? '&status=' . $_GET['status'] : ''; ?>" class="btn btn-outline-secondary">
                                <i class="fas fa-th"></i>
                            </a>
                            <a href="index.php?view=list<?php echo isset($_GET['status']) ? '&status=' . $_GET['status'] : ''; ?>" class="btn btn-outline-secondary">
                                <i class="fas fa-list"></i>
                            </a>
                        </div>
                        <button type="button" class="btn btn-outline-secondary ms-2" data-bs-toggle="modal" data-bs-target="#filterModal">
                            <i class="fas fa-filter me-1"></i> Filtros
                        </button>
                    </div>
                </div>

                <?php
                // Conexão com o banco de dados
                require_once 'config.php';
                
                try {
                    $conn = new PDO("mysql:host=$hostname;dbname=$database", $username, $password);
                    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                    
                    // Montar a consulta SQL com filtros
                    $params = [];
                    $sql = "SELECT * FROM equipamentos WHERE excluido = 'N'";
                    
                    // Filtro de status
                    if (isset($_GET['status']) && !empty($_GET['status'])) {
                        $status = $_GET['status'];
                        $sql .= " AND status = :status";
                        $params[':status'] = $status;
                    }
                    
                    // Filtro de busca
                    if (isset($_GET['search']) && !empty($_GET['search'])) {
                        $search = $_GET['search'];
                        $sql .= " AND (nome_equipamento LIKE :search OR placa_patrimonio LIKE :search OR observacao LIKE :search)";
                        $params[':search'] = "%$search%";
                    }
                    
                    // Filtro de filial
                    if (isset($_GET['filial']) && !empty($_GET['filial'])) {
                        $filial = $_GET['filial'];
                        $sql .= " AND filial = :filial";
                        $params[':filial'] = $filial;
                    }
                    
                    // Filtro de setor
                    if (isset($_GET['setor']) && !empty($_GET['setor'])) {
                        $setor = $_GET['setor'];
                        $sql .= " AND setor LIKE :setor";
                        $params[':setor'] = "%$setor%";
                    }
                    
                    // Ordenação
                    $sql .= " ORDER BY data_abertura DESC";
                    
                    $stmt = $conn->prepare($sql);
                    foreach ($params as $key => $value) {
                        $stmt->bindValue($key, $value);
                    }
                    $stmt->execute();
                    $equipamentos = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    
                    // Determinar o modo de visualização (grid ou lista)
                    $view = isset($_GET['view']) ? $_GET['view'] : 'grid';
                    
                    if ($view === 'grid') {
                        // Exibir em grade (cards)
                        echo '<div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">';
                        
                        if (count($equipamentos) === 0) {
                            echo '<div class="col-12"><div class="alert alert-info">Nenhum equipamento encontrado com os filtros aplicados.</div></div>';
                        } else {
                            foreach ($equipamentos as $equip) {
                                $statusClass = '';
                                $statusText = '';
                                
                                switch ($equip['status']) {
                                    case 'received':
                                        $statusClass = 'status-received';
                                        $statusText = 'Lançado';
                                        break;
                                    case 'sent':
                                        $statusClass = 'status-sent';
                                        $statusText = 'Em Manutenção';
                                        break;
                                    case 'completed':
                                        $statusClass = 'status-completed';
                                        $statusText = 'Concluído';
                                        break;
                                    default:
                                        $statusClass = '';
                                        $statusText = $equip['status'];
                                }
                                
                                echo '<div class="col">';
                                echo '<div class="card h-100">';
                                echo '<div class="card-header d-flex justify-content-between align-items-center">';
                                echo '<span class="status-badge ' . $statusClass . '">' . $statusText . '</span>';
                                echo '<div class="dropdown">';
                                echo '<button class="btn btn-sm btn-link" type="button" id="dropdownMenuButton' . $equip['id'] . '" data-bs-toggle="dropdown" aria-expanded="false">';
                                echo '<i class="fas fa-ellipsis-v"></i>';
                                echo '</button>';
                                echo '<ul class="dropdown-menu dropdown-menu-end" aria-labelledby="dropdownMenuButton' . $equip['id'] . '">';
                                echo '<li><a class="dropdown-item" href="view.php?id=' . $equip['id'] . '"><i class="fas fa-eye me-2"></i>Detalhes</a></li>';
                                echo '<li><a class="dropdown-item" href="form.php?id=' . $equip['id'] . '"><i class="fas fa-edit me-2"></i>Editar</a></li>';
                                
                                if ($equip['status'] === 'received') {
                                    echo '<li><a class="dropdown-item" href="status.php?id=' . $equip['id'] . '&action=send"><i class="fas fa-truck me-2"></i>Marcar como Entregue</a></li>';
                                } else if ($equip['status'] === 'sent') {
                                    echo '<li><a class="dropdown-item" href="status.php?id=' . $equip['id'] . '&action=complete"><i class="fas fa-check-circle me-2"></i>Marcar como Concluído</a></li>';
                                }
                                
                                echo '<li><hr class="dropdown-divider"></li>';
                                echo '<li><a class="dropdown-item text-danger" href="delete.php?id=' . $equip['id'] . '" onclick="return confirm(\'Tem certeza que deseja excluir este equipamento?\')"><i class="fas fa-trash me-2"></i>Excluir</a></li>';
                                echo '</ul>';
                                echo '</div>';
                                echo '</div>';
                                echo '<div class="card-body">';
                                echo '<h5 class="card-title">' . htmlspecialchars($equip['nome_equipamento']) . '</h5>';
                                echo '<p class="card-text mb-1"><strong>Patrimônio:</strong> ' . htmlspecialchars($equip['placa_patrimonio']) . '</p>';
                                echo '<p class="card-text mb-1"><strong>Filial:</strong> ' . htmlspecialchars($equip['filial']) . '</p>';
                                if (!empty($equip['setor'])) {
                                    echo '<p class="card-text mb-1"><strong>Setor:</strong> ' . htmlspecialchars($equip['setor']) . '</p>';
                                }
                                echo '<p class="card-text mb-1"><strong>Data de Abertura:</strong> ' . date('d/m/Y', strtotime($equip['data_abertura'])) . '</p>';
                                if (!empty($equip['observacao'])) {
                                    echo '<p class="card-text mt-2"><small class="text-muted">' . htmlspecialchars(substr($equip['observacao'], 0, 100)) . (strlen($equip['observacao']) > 100 ? '...' : '') . '</small></p>';
                                }
                                echo '</div>';
                                echo '</div>';
                                echo '</div>';
                            }
                        }
                        
                        echo '</div>';
                    } else {
                        // Exibir em lista (tabela)
                        echo '<div class="table-responsive">';
                        echo '<table class="table table-striped table-hover">';
                        echo '<thead>';
                        echo '<tr>';
                        echo '<th>Equipamento</th>';
                        echo '<th>Patrimônio</th>';
                        echo '<th>Filial</th>';
                        echo '<th>Setor</th>';
                        echo '<th>Status</th>';
                        echo '<th>Data Abertura</th>';
                        echo '<th>Ações</th>';
                        echo '</tr>';
                        echo '</thead>';
                        echo '<tbody>';
                        
                        if (count($equipamentos) === 0) {
                            echo '<tr><td colspan="7" class="text-center">Nenhum equipamento encontrado com os filtros aplicados.</td></tr>';
                        } else {
                            foreach ($equipamentos as $equip) {
                                $statusClass = '';
                                $statusText = '';
                                
                                switch ($equip['status']) {
                                    case 'received':
                                        $statusClass = 'status-received';
                                        $statusText = 'Lançado';
                                        break;
                                    case 'sent':
                                        $statusClass = 'status-sent';
                                        $statusText = 'Em Manutenção';
                                        break;
                                    case 'completed':
                                        $statusClass = 'status-completed';
                                        $statusText = 'Concluído';
                                        break;
                                    default:
                                        $statusClass = '';
                                        $statusText = $equip['status'];
                                }
                                
                                echo '<tr>';
                                echo '<td>' . htmlspecialchars($equip['nome_equipamento']) . '</td>';
                                echo '<td>' . htmlspecialchars($equip['placa_patrimonio']) . '</td>';
                                echo '<td>' . htmlspecialchars($equip['filial']) . '</td>';
                                echo '<td>' . htmlspecialchars($equip['setor'] ?? '') . '</td>';
                                echo '<td><span class="status-badge ' . $statusClass . '">' . $statusText . '</span></td>';
                                echo '<td>' . date('d/m/Y', strtotime($equip['data_abertura'])) . '</td>';
                                echo '<td>';
                                echo '<div class="btn-group" role="group">';
                                echo '<a href="view.php?id=' . $equip['id'] . '" class="btn btn-sm btn-outline-primary" title="Detalhes"><i class="fas fa-eye"></i></a>';
                                echo '<a href="form.php?id=' . $equip['id'] . '" class="btn btn-sm btn-outline-secondary" title="Editar"><i class="fas fa-edit"></i></a>';
                                
                                if ($equip['status'] === 'received') {
                                    echo '<a href="status.php?id=' . $equip['id'] . '&action=send" class="btn btn-sm btn-outline-primary" title="Marcar como Entregue"><i class="fas fa-truck"></i></a>';
                                } else if ($equip['status'] === 'sent') {
                                    echo '<a href="status.php?id=' . $equip['id'] . '&action=complete" class="btn btn-sm btn-outline-success" title="Marcar como Concluído"><i class="fas fa-check-circle"></i></a>';
                                }
                                
                                echo '<a href="delete.php?id=' . $equip['id'] . '" class="btn btn-sm btn-outline-danger" title="Excluir" onclick="return confirm(\'Tem certeza que deseja excluir este equipamento?\')"><i class="fas fa-trash"></i></a>';
                                echo '</div>';
                                echo '</td>';
                                echo '</tr>';
                            }
                        }
                        
                        echo '</tbody>';
                        echo '</table>';
                        echo '</div>';
                    }
                    
                } catch(PDOException $e) {
                    echo '<div class="alert alert-danger">Erro ao conectar com o banco de dados: ' . $e->getMessage() . '</div>';
                }
                ?>
            </main>
        </div>
    </div>

    <!-- Modal de Filtros -->
    <div class="modal fade" id="filterModal" tabindex="-1" aria-labelledby="filterModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="filterModalLabel">Filtros Avançados</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <form method="GET">
                    <div class="modal-body">
                        <div class="mb-3">
                            <label for="status" class="form-label">Status</label>
                            <select class="form-select" id="status" name="status">
                                <option value="">Todos</option>
                                <option value="received" <?php echo (isset($_GET['status']) && $_GET['status'] === 'received') ? 'selected' : ''; ?>>Lançado</option>
                                <option value="sent" <?php echo (isset($_GET['status']) && $_GET['status'] === 'sent') ? 'selected' : ''; ?>>Em Manutenção</option>
                                <option value="completed" <?php echo (isset($_GET['status']) && $_GET['status'] === 'completed') ? 'selected' : ''; ?>>Concluído</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label for="filial" class="form-label">Filial</label>
                            <select class="form-select" id="filial" name="filial">
                                <option value="">Todas</option>
                                <?php
                                try {
                                    $stmt = $conn->query("SELECT DISTINCT filial FROM equipamentos WHERE excluido = 'N' ORDER BY filial");
                                    $filiais = $stmt->fetchAll(PDO::FETCH_COLUMN);
                                    
                                    foreach ($filiais as $filial) {
                                        $selected = (isset($_GET['filial']) && $_GET['filial'] == $filial) ? 'selected' : '';
                                        echo '<option value="' . $filial . '" ' . $selected . '>' . $filial . '</option>';
                                    }
                                } catch(PDOException $e) {
                                    echo '<option value="">Erro ao carregar filiais</option>';
                                }
                                ?>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label for="setor" class="form-label">Setor</label>
                            <select class="form-select" id="setor" name="setor">
                                <option value="">Todos</option>
                                <?php
                                try {
                                    $stmt = $conn->query("SELECT DISTINCT setor FROM equipamentos WHERE setor IS NOT NULL AND setor != '' AND excluido = 'N' ORDER BY setor");
                                    $setores = $stmt->fetchAll(PDO::FETCH_COLUMN);
                                    
                                    foreach ($setores as $setor) {
                                        $selected = (isset($_GET['setor']) && $_GET['setor'] == $setor) ? 'selected' : '';
                                        echo '<option value="' . $setor . '" ' . $selected . '>' . $setor . '</option>';
                                    }
                                } catch(PDOException $e) {
                                    echo '<option value="">Erro ao carregar setores</option>';
                                }
                                ?>
                            </select>
                        </div>
                        <!-- Manter o modo de visualização atual -->
                        <?php if (isset($_GET['view'])): ?>
                        <input type="hidden" name="view" value="<?php echo htmlspecialchars($_GET['view']); ?>">
                        <?php endif; ?>
                        <!-- Manter o termo de busca -->
                        <?php if (isset($_GET['search'])): ?>
                        <input type="hidden" name="search" value="<?php echo htmlspecialchars($_GET['search']); ?>">
                        <?php endif; ?>
                    </div>
                    <div class="modal-footer">
                        <a href="index.php" class="btn btn-secondary">Limpar Filtros</a>
                        <button type="submit" class="btn btn-primary">Aplicar Filtros</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
