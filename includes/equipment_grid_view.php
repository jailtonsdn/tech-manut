
<?php
// Exibe os equipamentos em modo grade (cards)
function exibirEquipamentosEmGrid($equipamentos) {
    if (count($equipamentos) === 0) {
        echo '<div class="col-12"><div class="alert alert-info">Nenhum equipamento encontrado com os filtros aplicados.</div></div>';
        return;
    }
    
    foreach ($equipamentos as $equip) {
        $statusClass = getStatusClass($equip['status']);
        $statusText = getStatusText($equip['status']);
        
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
