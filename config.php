
<?php
// Configurações do banco de dados
$hostname = "localhost";
$username = "kalbir85_patrimonio";
$password = "Kalbir@1705!#";
$database = "kalbir85_patrimonio";

// Configurações da aplicação
$app_name = "Sistema de Manutenção";
$app_version = "1.0.0";

// Configurações de ambiente
$debug_mode = false;

// Configurar timezone
date_default_timezone_set('America/Sao_Paulo');

// Função para formatar valores em reais
function formataMoeda($valor) {
    return 'R$ ' . number_format($valor, 2, ',', '.');
}

// Função para formatar datas
function formataData($data) {
    if (empty($data)) return '-';
    return date('d/m/Y', strtotime($data));
}

// Função para obter status formatado
function formataStatus($status) {
    switch ($status) {
        case 'received':
            return ['texto' => 'Lançado', 'classe' => 'status-received'];
        case 'sent':
            return ['texto' => 'Em Manutenção', 'classe' => 'status-sent'];
        case 'completed':
            return ['texto' => 'Concluído', 'classe' => 'status-completed'];
        default:
            return ['texto' => $status, 'classe' => ''];
    }
}

// Funções de segurança
function limpaTexto($texto) {
    return htmlspecialchars(trim($texto), ENT_QUOTES, 'UTF-8');
}
?>
