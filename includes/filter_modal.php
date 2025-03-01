
<!-- Modal de Filtros -->
<div class="modal fade" id="filterModal" tabindex="-1" aria-labelledby="filterModalLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="filterModalLabel">Filtros Avançados</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <form method="GET">
                <div class="modal-body">
                    <div class="mb-3">
                        <label for="status" class="form-label">Status</label>
                        <select class="form-select" id="status" name="status">
                            <option value="">Todos</option>
                            <option value="received" <?php echo (isset($_GET['status']) && $_GET['status'] === 'received') ? 'selected' : ''; ?>>Lançado</option>
                            <option value="sent" <?php echo (isset($_GET['status']) && $_GET['status'] === 'sent') ? 'selected' : ''; ?>>Em Manutenção</option>
                            <option value="completed" <?php echo (isset($_GET['status']) && $_GET['status'] === 'completed') ? 'selected' : ''; ?>>Concluído</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label for="filial" class="form-label">Filial</label>
                        <select class="form-select" id="filial" name="filial">
                            <option value="">Todas</option>
                            <?php
                            try {
                                $stmt = $conn->query("SELECT DISTINCT filial FROM equipamentos WHERE excluido = 'N' ORDER BY filial");
                                $filiais = $stmt->fetchAll(PDO::FETCH_COLUMN);
                                
                                foreach ($filiais as $filial) {
                                    $selected = (isset($_GET['filial']) && $_GET['filial'] == $filial) ? 'selected' : '';
                                    echo '<option value="' . $filial . '" ' . $selected . '>' . $filial . '</option>';
                                }
                            } catch(PDOException $e) {
                                echo '<option value="">Erro ao carregar filiais</option>';
                            }
                            ?>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label for="setor" class="form-label">Setor</label>
                        <select class="form-select" id="setor" name="setor">
                            <option value="">Todos</option>
                            <?php
                            try {
                                $stmt = $conn->query("SELECT DISTINCT setor FROM equipamentos WHERE setor IS NOT NULL AND setor != '' AND excluido = 'N' ORDER BY setor");
                                $setores = $stmt->fetchAll(PDO::FETCH_COLUMN);
                                
                                foreach ($setores as $setor) {
                                    $selected = (isset($_GET['setor']) && $_GET['setor'] == $setor) ? 'selected' : '';
                                    echo '<option value="' . $setor . '" ' . $selected . '>' . $setor . '</option>';
                                }
                            } catch(PDOException $e) {
                                echo '<option value="">Erro ao carregar setores</option>';
                            }
                            ?>
                        </select>
                    </div>
                    <!-- Manter o modo de visualização atual -->
                    <?php if (isset($_GET['view'])): ?>
                    <input type="hidden" name="view" value="<?php echo htmlspecialchars($_GET['view']); ?>">
                    <?php endif; ?>
                    <!-- Manter o termo de busca -->
                    <?php if (isset($_GET['search'])): ?>
                    <input type="hidden" name="search" value="<?php echo htmlspecialchars($_GET['search']); ?>">
                    <?php endif; ?>
                </div>
                <div class="modal-footer">
                    <a href="index.php" class="btn btn-secondary">Limpar Filtros</a>
                    <button type="submit" class="btn btn-primary">Aplicar Filtros</button>
                </div>
            </form>
        </div>
    </div>
</div>
