
<?php
// Arquivo para visualizar os detalhes de um equipamento
session_start();
require_once 'config.php';

if (!isset($_GET['id']) || empty($_GET['id'])) {
    $_SESSION['mensagem'] = "ID do equipamento não informado.";
    $_SESSION['tipo_mensagem'] = "danger";
    header("Location: index.php");
    exit;
}

$id = intval($_GET['id']);

try {
    $conn = new PDO("mysql:host=$hostname;dbname=$database", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $stmt = $conn->prepare("SELECT * FROM equipamentos WHERE id = :id AND excluido = 'N'");
    $stmt->bindParam(':id', $id);
    $stmt->execute();
    $equipamento = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$equipamento) {
        $_SESSION['mensagem'] = "Equipamento não encontrado.";
        $_SESSION['tipo_mensagem'] = "danger";
        header("Location: index.php");
        exit;
    }
    
    $status = formataStatus($equipamento['status']);
    
} catch(PDOException $e) {
    $_SESSION['mensagem'] = "Erro ao conectar com o banco de dados: " . $e->getMessage();
    $_SESSION['tipo_mensagem'] = "danger";
    header("Location: index.php");
    exit;
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Detalhes do Equipamento - Sistema de Manutenção</title>
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
                </div>
            </div>

            <!-- Conteúdo principal -->
            <main class="col-md-9 ms-sm-auto col-lg-10 px-md-4">
                <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                    <h1 class="h2">Detalhes do Equipamento</h1>
                    <div class="btn-toolbar mb-2 mb-md-0">
                        <a href="index.php" class="btn btn-outline-secondary me-2">
                            <i class="fas fa-arrow-left me-1"></i> Voltar
                        </a>
                        <a href="form.php?id=<?php echo $id; ?>" class="btn btn-primary me-2">
                            <i class="fas fa-edit me-1"></i> Editar
                        </a>
                        <?php if ($equipamento['status'] === 'received'): ?>
                        <a href="status.php?id=<?php echo $id; ?>&action=send" class="btn btn-outline-primary me-2">
                            <i class="fas fa-truck me-1"></i> Marcar como Entregue
                        </a>
                        <?php elseif ($equipamento['status'] === 'sent'): ?>
                        <a href="status.php?id=<?php echo $id; ?>&action=complete" class="btn btn-outline-success me-2">
                            <i class="fas fa-check-circle me-1"></i> Marcar como Concluído
                        </a>
                        <?php endif; ?>
                        <a href="delete.php?id=<?php echo $id; ?>" class="btn btn-outline-danger" onclick="return confirm('Tem certeza que deseja excluir este equipamento?')">
                            <i class="fas fa-trash me-1"></i> Excluir
                        </a>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <div class="d-flex justify-content-between align-items-center">
                            <h5 class="mb-0"><?php echo htmlspecialchars($equipamento['nome_equipamento']); ?></h5>
                            <span class="status-badge <?php echo $status['classe']; ?>"><?php echo $status['texto']; ?></span>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-6">
                                <h6 class="mb-3">Informações Básicas</h6>
                                <table class="table table-borderless">
                                    <tr>
                                        <th style="width: 35%">Placa de Patrimônio:</th>
                                        <td><?php echo htmlspecialchars($equipamento['placa_patrimonio']); ?></td>
                                    </tr>
                                    <tr>
                                        <th>Filial:</th>
                                        <td><?php echo htmlspecialchars($equipamento['filial']); ?></td>
                                    </tr>
                                    <tr>
                                        <th>Setor:</th>
                                        <td><?php echo htmlspecialchars($equipamento['setor'] ?? '-'); ?></td>
                                    </tr>
                                    <tr>
                                        <th>Destino:</th>
                                        <td><?php echo htmlspecialchars($equipamento['destino'] ?? '-'); ?></td>
                                    </tr>
                                </table>
                            </div>
                            <div class="col-md-6">
                                <h6 class="mb-3">Datas e Status</h6>
                                <table class="table table-borderless">
                                    <tr>
                                        <th style="width: 35%">Data de Abertura:</th>
                                        <td><?php echo formataData($equipamento['data_abertura']); ?></td>
                                    </tr>
                                    <tr>
                                        <th>Data de Entrega:</th>
                                        <td><?php echo formataData($equipamento['data_entrega'] ?? ''); ?></td>
                                    </tr>
                                    <tr>
                                        <th>Data de Devolução:</th>
                                        <td><?php echo formataData($equipamento['data_devolucao'] ?? ''); ?></td>
                                    </tr>
                                    <tr>
                                        <th>Status Atual:</th>
                                        <td><span class="status-badge <?php echo $status['classe']; ?>"><?php echo $status['texto']; ?></span></td>
                                    </tr>
                                </table>
                            </div>
                        </div>
                        
                        <?php if ($equipamento['status'] === 'completed' && (!empty($equipamento['data_devolucao']) || !empty($equipamento['imagem']))): ?>
                        <div class="row mt-4">
                            <div class="col-12">
                                <h6 class="mb-3">Informações da Conclusão</h6>
                                <table class="table table-borderless">
                                    <?php if (!empty($equipamento['imagem'])): ?>
                                    <tr>
                                        <th style="width: 20%">Imagem/NF:</th>
                                        <td>
                                            <?php if (filter_var($equipamento['imagem'], FILTER_VALIDATE_URL)): ?>
                                                <a href="<?php echo htmlspecialchars($equipamento['imagem']); ?>" target="_blank" class="btn btn-sm btn-outline-primary">
                                                    <i class="fas fa-external-link-alt me-1"></i> Ver Imagem/NF
                                                </a>
                                            <?php else: ?>
                                                <?php echo htmlspecialchars($equipamento['imagem']); ?>
                                            <?php endif; ?>
                                        </td>
                                    </tr>
                                    <?php endif; ?>
                                </table>
                            </div>
                        </div>
                        <?php endif; ?>
                        
                        <?php if (!empty($equipamento['observacao'])): ?>
                        <div class="row mt-4">
                            <div class="col-12">
                                <h6 class="mb-2">Observações</h6>
                                <div class="p-3 bg-light rounded">
                                    <?php echo nl2br(htmlspecialchars($equipamento['observacao'])); ?>
                                </div>
                            </div>
                        </div>
                        <?php endif; ?>
                    </div>
                </div>
            </main>
        </div>
    </div>

    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
