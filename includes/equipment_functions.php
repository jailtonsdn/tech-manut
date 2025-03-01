
<?php
// Funções relacionadas aos equipamentos

function buscarEquipamentos($conn, $filtros = array()) {
    if (!$conn) {
        return array();
    }
    
    $params = [];
    $sql = "SELECT * FROM equipamentos WHERE excluido = 'N'";
    
    // Filtro de status
    if (isset($filtros['status']) && !empty($filtros['status'])) {
        $status = $filtros['status'];
        $sql .= " AND status = :status";
        $params[':status'] = $status;
    }
    
    // Filtro de busca
    if (isset($filtros['search']) && !empty($filtros['search'])) {
        $search = $filtros['search'];
        $sql .= " AND (nome_equipamento LIKE :search OR placa_patrimonio LIKE :search OR observacao LIKE :search)";
        $params[':search'] = "%$search%";
    }
    
    // Filtro de filial
    if (isset($filtros['filial']) && !empty($filtros['filial'])) {
        $filial = $filtros['filial'];
        $sql .= " AND filial = :filial";
        $params[':filial'] = $filial;
    }
    
    // Filtro de setor
    if (isset($filtros['setor']) && !empty($filtros['setor'])) {
        $setor = $filtros['setor'];
        $sql .= " AND setor LIKE :setor";
        $params[':setor'] = "%$setor%";
    }
    
    // Ordenação
    $sql .= " ORDER BY data_abertura DESC";
    
    try {
        $stmt = $conn->prepare($sql);
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch(PDOException $e) {
        echo '<div class="alert alert-danger">Erro ao buscar equipamentos: ' . $e->getMessage() . '</div>';
        return array();
    }
}

function getStatusText($status) {
    switch ($status) {
        case 'received':
            return 'Lançado';
        case 'sent':
            return 'Em Manutenção';
        case 'completed':
            return 'Concluído';
        default:
            return $status;
    }
}

function getStatusClass($status) {
    switch ($status) {
        case 'received':
            return 'status-received';
        case 'sent':
            return 'status-sent';
        case 'completed':
            return 'status-completed';
        default:
            return '';
    }
}
