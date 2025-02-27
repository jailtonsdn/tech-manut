
<?php
// Arquivo para atualizar o status de um equipamento (enviar para manutenção ou concluir)
session_start();
require_once 'config.php';

if (!isset($_GET['id']) || empty($_GET['id']) || !isset($_GET['action']) || empty($_GET['action'])) {
    $_SESSION['mensagem'] = "Parâmetros inválidos.";
    $_SESSION['tipo_mensagem'] = "danger";
    header("Location: index.php");
    exit;
}

$id = intval($_GET['id']);
$action = $_GET['action'];

// Verifica se a ação é válida
if ($action !== 'send' && $action !== 'complete') {
    $_SESSION['mensagem'] = "Ação inválida.";
    $_SESSION['tipo_mensagem'] = "danger";
    header("Location: index.php");
    exit;
}

try {
    $conn = new PDO("mysql:host=$hostname;dbname=$database", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Verifica se o equipamento existe e seu status atual
    $stmt = $conn->prepare("SELECT status FROM equipamentos WHERE id = :id AND excluido = 'N'");
    $stmt->bindParam(':id', $id);
    $stmt->execute();
    $equipamento = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$equipamento) {
        $_SESSION['mensagem'] = "Equipamento não encontrado.";
        $_SESSION['tipo_mensagem'] = "danger";
        header("Location: index.php");
        exit;
    }
    
    // Processa o formulário quando enviado
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        if ($action === 'send') {
            // Atualizar para status "sent" (em manutenção)
            $data_entrega = $_POST['data_entrega'] ?? date('Y-m-d');
            
            $stmt = $conn->prepare("
                UPDATE equipamentos SET 
                    status = 'sent',
                    data_entrega = :data_entrega
                WHERE id = :id
            ");
            $stmt->bindParam(':id', $id);
            $stmt->bindParam(':data_entrega', $data_entrega);
            $stmt->execute();
            
            $_SESSION['mensagem'] = "Equipamento marcado como entregue para manutenção.";
            $_SESSION['tipo_mensagem'] = "success";
            
        } else if ($action === 'complete') {
            // Atualizar para status "completed" (concluído)
            $data_devolucao = $_POST['data_devolucao'] ?? date('Y-m-d');
            $valor = isset($_POST['valor']) ? str_replace(',', '.', $_POST['valor']) : null;
            $nota_fiscal = $_POST['nota_fiscal'] ?? '';
            
            $stmt = $conn->prepare("
                UPDATE equipamentos SET 
                    status = 'completed',
                    data_devolucao = :data_devolucao,
                    valor = :valor,
                    nota_fiscal = :nota_fiscal
                WHERE id = :id
            ");
            $stmt->bindParam(':id', $id);
            $stmt->bindParam(':data_devolucao', $data_devolucao);
            $stmt->bindParam(':valor', $valor);
            $stmt->bindParam(':nota_fiscal', $nota_fiscal);
            $stmt->execute();
            
            $_SESSION['mensagem'] = "Manutenção concluída com sucesso.";
            $_SESSION['tipo_mensagem'] = "success";
        }
        
        header("Location: index.php");
        exit;
    }
    
} catch(PDOException $e) {
    $_SESSION['mensagem'] = "Erro ao conectar com o banco de dados: " . $e->getMessage();
    $_SESSION['tipo_mensagem'] = "danger";
    header("Location: index.php");
    exit;
}

$titulo = $action === 'send' ? "Entregar para Manutenção" : "Concluir Manutenção";
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
                    <h1 class="h2"><?php echo $titulo; ?></h1>
                    <div class="btn-toolbar mb-2 mb-md-0">
                        <a href="index.php" class="btn btn-outline-secondary">
                            <i class="fas fa-arrow-left me-1"></i> Voltar
                        </a>
                    </div>
                </div>

                <div class="card">
                    <div class="card-body">
                        <form method="POST">
                            <?php if ($action === 'send'): ?>
                            <div class="mb-3">
                                <label for="data_entrega" class="form-label">Data de Entrega*</label>
                                <input type="date" class="form-control" id="data_entrega" name="data_entrega" required value="<?php echo date('Y-m-d'); ?>">
                                <div class="form-text">Data em que o equipamento foi entregue para manutenção.</div>
                            </div>
                            <?php else: ?>
                            <div class="mb-3">
                                <label for="data_devolucao" class="form-label">Data de Devolução*</label>
                                <input type="date" class="form-control" id="data_devolucao" name="data_devolucao" required value="<?php echo date('Y-m-d'); ?>">
                                <div class="form-text">Data em que o equipamento foi devolvido da manutenção.</div>
                            </div>
                            <div class="mb-3">
                                <label for="nota_fiscal" class="form-label">Número da Nota Fiscal</label>
                                <input type="text" class="form-control" id="nota_fiscal" name="nota_fiscal">
                            </div>
                            <div class="mb-3">
                                <label for="valor" class="form-label">Valor (R$)</label>
                                <input type="text" class="form-control" id="valor" name="valor" placeholder="0,00">
                            </div>
                            <?php endif; ?>
                            <div class="d-flex justify-content-end">
                                <a href="index.php" class="btn btn-outline-secondary me-2">Cancelar</a>
                                <button type="submit" class="btn btn-primary">Confirmar</button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    </div>

    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
