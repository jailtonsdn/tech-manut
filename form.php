
<?php
// Arquivo para adicionar/editar equipamentos
session_start();
require_once 'config.php';

$id = isset($_GET['id']) ? intval($_GET['id']) : 0;
$titulo = $id > 0 ? "Editar Equipamento" : "Adicionar Equipamento";
$equipamento = [];

try {
    $conn = new PDO("mysql:host=$hostname;dbname=$database", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Se for edição, busca os dados do equipamento
    if ($id > 0) {
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
    }
    
    // Processa o formulário quando enviado
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $nome_equipamento = $_POST['nome_equipamento'] ?? '';
        $placa_patrimonio = $_POST['placa_patrimonio'] ?? '';
        $filial = $_POST['filial'] ?? '';
        $setor = $_POST['setor'] ?? '';
        $destino = $_POST['destino'] ?? '';
        $data_abertura = $_POST['data_abertura'] ?? date('Y-m-d');
        $observacao = $_POST['observacao'] ?? '';
        $status = 'received'; // Status inicial é sempre 'received'
        
        // Valida os campos obrigatórios
        $erros = [];
        if (empty($nome_equipamento)) $erros[] = "Nome do equipamento é obrigatório.";
        if (empty($placa_patrimonio)) $erros[] = "Placa de patrimônio é obrigatória.";
        if (empty($filial)) $erros[] = "Filial é obrigatória.";
        if (empty($data_abertura)) $erros[] = "Data de abertura é obrigatória.";
        
        if (empty($erros)) {
            if ($id > 0) {
                // Atualiza um equipamento existente
                $stmt = $conn->prepare("
                    UPDATE equipamentos SET 
                        nome_equipamento = :nome_equipamento,
                        placa_patrimonio = :placa_patrimonio,
                        filial = :filial,
                        setor = :setor,
                        destino = :destino,
                        data_abertura = :data_abertura,
                        observacao = :observacao
                    WHERE id = :id
                ");
                $stmt->bindParam(':id', $id);
                $stmt->bindParam(':nome_equipamento', $nome_equipamento);
                $stmt->bindParam(':placa_patrimonio', $placa_patrimonio);
                $stmt->bindParam(':filial', $filial);
                $stmt->bindParam(':setor', $setor);
                $stmt->bindParam(':destino', $destino);
                $stmt->bindParam(':data_abertura', $data_abertura);
                $stmt->bindParam(':observacao', $observacao);
                $stmt->execute();
                
                $_SESSION['mensagem'] = "Equipamento atualizado com sucesso!";
                $_SESSION['tipo_mensagem'] = "success";
            } else {
                // Insere um novo equipamento
                $stmt = $conn->prepare("
                    INSERT INTO equipamentos (
                        nome_equipamento, placa_patrimonio, filial, setor, destino,
                        data_abertura, status, observacao, excluido
                    ) VALUES (
                        :nome_equipamento, :placa_patrimonio, :filial, :setor, :destino,
                        :data_abertura, :status, :observacao, 'N'
                    )
                ");
                $stmt->bindParam(':nome_equipamento', $nome_equipamento);
                $stmt->bindParam(':placa_patrimonio', $placa_patrimonio);
                $stmt->bindParam(':filial', $filial);
                $stmt->bindParam(':setor', $setor);
                $stmt->bindParam(':destino', $destino);
                $stmt->bindParam(':data_abertura', $data_abertura);
                $stmt->bindParam(':status', $status);
                $stmt->bindParam(':observacao', $observacao);
                $stmt->execute();
                
                $_SESSION['mensagem'] = "Equipamento adicionado com sucesso!";
                $_SESSION['tipo_mensagem'] = "success";
            }
            
            header("Location: index.php");
            exit;
        }
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

                <?php if (!empty($erros)): ?>
                <div class="alert alert-danger">
                    <ul class="mb-0">
                        <?php foreach ($erros as $erro): ?>
                        <li><?php echo $erro; ?></li>
                        <?php endforeach; ?>
                    </ul>
                </div>
                <?php endif; ?>

                <div class="card">
                    <div class="card-body">
                        <form method="POST">
                            <div class="row mb-3">
                                <div class="col-md-6">
                                    <label for="nome_equipamento" class="form-label">Nome do Equipamento*</label>
                                    <input type="text" class="form-control" id="nome_equipamento" name="nome_equipamento" required
                                           value="<?php echo isset($equipamento['nome_equipamento']) ? htmlspecialchars($equipamento['nome_equipamento']) : ''; ?>">
                                </div>
                                <div class="col-md-6">
                                    <label for="placa_patrimonio" class="form-label">Placa de Patrimônio*</label>
                                    <input type="text" class="form-control" id="placa_patrimonio" name="placa_patrimonio" required
                                           value="<?php echo isset($equipamento['placa_patrimonio']) ? htmlspecialchars($equipamento['placa_patrimonio']) : ''; ?>">
                                </div>
                            </div>
                            <div class="row mb-3">
                                <div class="col-md-4">
                                    <label for="filial" class="form-label">Filial*</label>
                                    <input type="text" class="form-control" id="filial" name="filial" required
                                           value="<?php echo isset($equipamento['filial']) ? htmlspecialchars($equipamento['filial']) : ''; ?>">
                                </div>
                                <div class="col-md-4">
                                    <label for="setor" class="form-label">Setor</label>
                                    <input type="text" class="form-control" id="setor" name="setor"
                                           value="<?php echo isset($equipamento['setor']) ? htmlspecialchars($equipamento['setor']) : ''; ?>">
                                </div>
                                <div class="col-md-4">
                                    <label for="destino" class="form-label">Destino</label>
                                    <input type="text" class="form-control" id="destino" name="destino"
                                           value="<?php echo isset($equipamento['destino']) ? htmlspecialchars($equipamento['destino']) : ''; ?>">
                                </div>
                            </div>
                            <div class="row mb-3">
                                <div class="col-md-4">
                                    <label for="data_abertura" class="form-label">Data de Abertura*</label>
                                    <input type="date" class="form-control" id="data_abertura" name="data_abertura" required
                                           value="<?php echo isset($equipamento['data_abertura']) ? $equipamento['data_abertura'] : date('Y-m-d'); ?>">
                                </div>
                                <?php if (isset($equipamento['status'])): ?>
                                <div class="col-md-4">
                                    <label for="status" class="form-label">Status</label>
                                    <input type="text" class="form-control" id="status" readonly
                                           value="<?php echo formataStatus($equipamento['status'])['texto']; ?>">
                                </div>
                                <?php endif; ?>
                            </div>
                            <div class="mb-3">
                                <label for="observacao" class="form-label">Observações</label>
                                <textarea class="form-control" id="observacao" name="observacao" rows="3"><?php echo isset($equipamento['observacao']) ? htmlspecialchars($equipamento['observacao']) : ''; ?></textarea>
                            </div>
                            <div class="d-flex justify-content-end">
                                <a href="index.php" class="btn btn-outline-secondary me-2">Cancelar</a>
                                <button type="submit" class="btn btn-primary">Salvar</button>
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
