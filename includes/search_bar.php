
<!-- Barra de pesquisa e filtros -->
<div class="row mb-4">
    <div class="col-md-6">
        <form method="GET">
            <div class="input-group">
                <span class="input-group-text"><i class="fas fa-search"></i></span>
                <input type="text" class="form-control" name="search" placeholder="Buscar equipamentos..." 
                       value="<?php echo isset($_GET['search']) ? htmlspecialchars($_GET['search']) : ''; ?>">
                <button class="btn btn-outline-secondary" type="submit">Buscar</button>
            </div>
        </form>
    </div>
    <div class="col-md-6 d-flex justify-content-end">
        <div class="btn-group" role="group">
            <a href="index.php?view=grid<?php echo isset($_GET['status']) ? '&status=' . $_GET['status'] : ''; ?>" class="btn btn-outline-secondary">
                <i class="fas fa-th"></i>
            </a>
            <a href="index.php?view=list<?php echo isset($_GET['status']) ? '&status=' . $_GET['status'] : ''; ?>" class="btn btn-outline-secondary">
                <i class="fas fa-list"></i>
            </a>
        </div>
        <button type="button" class="btn btn-outline-secondary ms-2" data-bs-toggle="modal" data-bs-target="#filterModal">
            <i class="fas fa-filter me-1"></i> Filtros
        </button>
    </div>
</div>
