
<?php
// Arquivo para exibir as notas fiscais registradas
session_start();
require_once 'config.php';

$titulo = "Notas Fiscais";

try {
    $conn = new PDO("mysql:host=$hostname;dbname=$database", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Buscar equipamentos concluídos com notas fiscais
    $sql = "
        SELECT 
            e.*,
            COUNT(*) OVER(PARTITION BY e.nota_fiscal) as total_itens,
            SUM(e.valor) OVER(PARTITION BY e.nota_fiscal) as valor_total
        FROM equipamentos e
        WHERE 
            e.status = 'completed' 
            AND e.nota_fiscal IS NOT NULL 
            AND e.nota_fiscal != ''
            AND e.excluido = 'N'
        ORDER BY e.data_devolucao DESC
    ";
    $stmt = $conn->query($sql);
    $equipamentos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Processar para agrupamento por nota fiscal
    $notas_fiscais = [];
    foreach ($equipamentos as $equip) {
        if (!isset($notas_fiscais[$equip['nota_fiscal']])) {
            $notas_fiscais[$equip['nota_fiscal']] = [
                'numero' => $equip['nota_fiscal'],
                'data' => $equip['data_devolucao'],
                'total_itens' => $equip['total_itens'],
                'valor_total' => $equip['valor_total'],
                'itens' => []
            ];
        }
        
        $notas_fiscais[$equip['nota_fiscal']]['itens'][] = [
            'id' => $equip['id'],
            'nome' => $equip['nome_equipamento'],
            'patrimonio' => $equip['placa_patrimonio'],
            'filial' => $equip['filial'],
            'setor' => $equip['setor'],
            'valor' => $equip['valor']
        ];
    }
    
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
    <style>
        .card-invoice {
            transition: all 0.3s;
        }
        .card-invoice:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 20px rgba(0,0,0,0.1);
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
                            <a class="nav-link" href="dashboard.php">
                                <i class="fas fa-chart-bar me-2"></i>
                                Dashboard
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link active" href="invoices.php">
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
                            <button type="button" class="btn btn-outline-secondary" onclick="window.print()">
                                <i class="fas fa-print me-1"></i> Imprimir
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Exibir mensagens se houver -->
                <?php if (isset($_SESSION['mensagem'])): ?>
                <div class="alert alert-<?php echo $_SESSION['tipo_mensagem']; ?> alert-dismissible fade show" role="alert">
                    <?php echo $_SESSION['mensagem']; ?>
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>
                <?php 
                    unset($_SESSION['mensagem']);
                    unset($_SESSION['tipo_mensagem']);
                endif; 
                ?>

                <!-- Lista de Notas Fiscais -->
                <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4 mb-4">
                    <?php if (empty($notas_fiscais)): ?>
                    <div class="col-12">
                        <div class="alert alert-info">
                            Nenhuma nota fiscal registrada ainda.
                        </div>
                    </div>
                    <?php else: ?>
                        <?php foreach ($notas_fiscais as $nf): ?>
                        <div class="col">
                            <div class="card card-invoice h-100">
                                <div class="card-header bg-primary bg-opacity-10">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <h5 class="card-title mb-0 text-primary">NF: <?php echo htmlspecialchars($nf['numero']); ?></h5>
                                        <span class="badge bg-primary rounded-pill"><?php echo $nf['total_itens']; ?> item(ns)</span>
                                    </div>
                                </div>
                                <div class="card-body">
                                    <p class="card-text mb-1"><strong>Data:</strong> <?php echo formataData($nf['data']); ?></p>
                                    <p class="card-text mb-1"><strong>Valor Total:</strong> <?php echo formataMoeda($nf['valor_total']); ?></p>
                                    
                                    <hr>
                                    
                                    <h6 class="mb-2">Itens da Nota:</h6>
                                    <div class="table-responsive">
                                        <table class="table table-sm table-hover">
                                            <thead>
                                                <tr>
                                                    <th>Equipamento</th>
                                                    <th class="text-end">Valor</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <?php foreach ($nf['itens'] as $item): ?>
                                                <tr>
                                                    <td>
                                                        <a href="view.php?id=<?php echo $item['id']; ?>" class="text-decoration-none">
                                                            <?php echo htmlspecialchars($item['nome']); ?>
                                                        </a>
                                                        <br>
                                                        <small class="text-muted">
                                                            Patrimônio: <?php echo htmlspecialchars($item['patrimonio']); ?>
                                                        </small>
                                                    </td>
                                                    <td class="text-end"><?php echo formataMoeda($item['valor']); ?></td>
                                                </tr>
                                                <?php endforeach; ?>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                <div class="card-footer bg-transparent d-flex justify-content-between align-items-center">
                                    <small class="text-muted">Filial: <?php echo htmlspecialchars($nf['itens'][0]['filial']); ?></small>
                                    <a href="#" class="btn btn-sm btn-outline-primary" onclick="window.print()">
                                        <i class="fas fa-print"></i>
                                    </a>
                                </div>
                            </div>
                        </div>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </div>
            </main>
        </div>
    </div>

    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
