
<?php
// Arquivo para excluir um equipamento (exclusão lógica)
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
    
    // Verifica se o equipamento existe
    $stmt = $conn->prepare("SELECT id FROM equipamentos WHERE id = :id AND excluido = 'N'");
    $stmt->bindParam(':id', $id);
    $stmt->execute();
    
    if ($stmt->rowCount() === 0) {
        $_SESSION['mensagem'] = "Equipamento não encontrado.";
        $_SESSION['tipo_mensagem'] = "danger";
        header("Location: index.php");
        exit;
    }
    
    // Exclusão lógica - atualiza o campo "excluido" para 'S'
    $stmt = $conn->prepare("UPDATE equipamentos SET excluido = 'S' WHERE id = :id");
    $stmt->bindParam(':id', $id);
    $stmt->execute();
    
    $_SESSION['mensagem'] = "Equipamento excluído com sucesso.";
    $_SESSION['tipo_mensagem'] = "success";
    
} catch(PDOException $e) {
    $_SESSION['mensagem'] = "Erro ao conectar com o banco de dados: " . $e->getMessage();
    $_SESSION['tipo_mensagem'] = "danger";
}

header("Location: index.php");
exit;
?>
