
<?php
// Arquivo principal que exibirá a lista de equipamentos
$page_title = "Equipamentos em Manutenção";

// Incluir cabeçalho
include_once 'includes/header.php';

// Incluir conexão com o banco
include_once 'includes/db_connection.php';

// Incluir funções de equipamentos
include_once 'includes/equipment_functions.php';
include_once 'includes/equipment_grid_view.php';
include_once 'includes/equipment_list_view.php';

// Estabelecer conexão com o banco
$conn = conectarBD();
?>

<?php include_once 'includes/sidebar.php'; ?>

<!-- Conteúdo principal -->
<main class="col-md-9 ms-sm-auto col-lg-10 px-md-4">
    <?php include_once 'includes/main_content_header.php'; ?>
    
    <?php include_once 'includes/search_bar.php'; ?>

    <?php
    // Preparar filtros com base na URL
    $filtros = array();
    
    if (isset($_GET['status']) && !empty($_GET['status'])) {
        $filtros['status'] = $_GET['status'];
    }
    
    if (isset($_GET['search']) && !empty($_GET['search'])) {
        $filtros['search'] = $_GET['search'];
    }
    
    if (isset($_GET['filial']) && !empty($_GET['filial'])) {
        $filtros['filial'] = $_GET['filial'];
    }
    
    if (isset($_GET['setor']) && !empty($_GET['setor'])) {
        $filtros['setor'] = $_GET['setor'];
    }
    
    // Buscar equipamentos
    $equipamentos = buscarEquipamentos($conn, $filtros);
    
    // Determinar o modo de visualização (grid ou lista)
    $view = isset($_GET['view']) ? $_GET['view'] : 'grid';
    
    if ($view === 'grid') {
        // Exibir em grade (cards)
        echo '<div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">';
        exibirEquipamentosEmGrid($equipamentos);
        echo '</div>';
    } else {
        // Exibir em lista (tabela)
        exibirEquipamentosEmLista($equipamentos);
    }
    ?>
</main>

<?php
// Incluir o modal de filtros
include_once 'includes/filter_modal.php';

// Incluir o rodapé
include_once 'includes/footer.php';
?>
