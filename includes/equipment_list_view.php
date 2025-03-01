
<?php
// Exibe os equipamentos em modo lista (tabela)
function exibirEquipamentosEmLista($equipamentos) {
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
            $statusClass = getStatusClass($equip['status']);
            $statusText = getStatusText($equip['status']);
            
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
