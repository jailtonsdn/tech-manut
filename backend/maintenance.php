
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Configurações do banco de dados
$hostname = "localhost";
$username = "kalbir85_patrimonio";
$password = "Kalbir@1705!#";
$database = "kalbir85_patrimonio";

// Cria a conexão
$db_connection = mysqli_connect($hostname, $username, $password, $database);

// Verifica a conexão
if (!$db_connection) {
    http_response_code(500);
    echo json_encode(['error' => 'Erro de conexão com o banco de dados: ' . mysqli_connect_error()]);
    exit;
}

// Define o charset para UTF-8
mysqli_set_charset($db_connection, "utf8");

// Obter o método HTTP
$method = $_SERVER['REQUEST_METHOD'];

// Obter o ID do registro, se fornecido na URL
$id = null;
if (isset($_GET['id'])) {
    $id = $_GET['id'];
}

// Tratar preflight CORS
if ($method == 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Processar a requisição com base no método HTTP
switch ($method) {
    case 'GET':
        // Listar todos os registros ou um específico
        if ($id) {
            // Buscar um registro específico
            $query = "SELECT * FROM equipamentos WHERE id = ? AND excluido = 'N'";
            $stmt = mysqli_prepare($db_connection, $query);
            mysqli_stmt_bind_param($stmt, "i", $id);
            mysqli_stmt_execute($stmt);
            $result = mysqli_stmt_get_result($stmt);
            
            if ($row = mysqli_fetch_assoc($result)) {
                echo json_encode($row);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Registro não encontrado']);
            }
        } else {
            // Listar todos os registros
            $query = "SELECT * FROM equipamentos WHERE excluido = 'N' ORDER BY data_abertura DESC";
            $result = mysqli_query($db_connection, $query);
            
            $records = [];
            while ($row = mysqli_fetch_assoc($result)) {
                $records[] = $row;
            }
            
            echo json_encode($records);
        }
        break;
        
    case 'POST':
        // Criar um novo registro
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!$data) {
            http_response_code(400);
            echo json_encode(['error' => 'Dados inválidos ou ausentes']);
            break;
        }
        
        $query = "INSERT INTO equipamentos (
            nome_equipamento, placa_patrimonio, filial, setor, destino,
            data_abertura, status, observacao, imagem, excluido
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'N')";
        
        $stmt = mysqli_prepare($db_connection, $query);
        
        $nome_equipamento = $data['nome_equipamento'] ?? '';
        $placa_patrimonio = $data['placa_patrimonio'] ?? '';
        $filial = $data['filial'] ?? 0;
        $setor = $data['setor'] ?? null;
        $destino = $data['destino'] ?? null;
        $data_abertura = $data['data_abertura'] ?? date('Y-m-d');
        $status = $data['status'] ?? 'received';
        $observacao = $data['observacao'] ?? '';
        $imagem = $data['imagem'] ?? '';
        
        mysqli_stmt_bind_param($stmt, "ssissssss", 
            $nome_equipamento, $placa_patrimonio, $filial, $setor, $destino,
            $data_abertura, $status, $observacao, $imagem
        );
        
        if (mysqli_stmt_execute($stmt)) {
            $id = mysqli_insert_id($db_connection);
            
            // Retornar o registro criado
            $query = "SELECT * FROM equipamentos WHERE id = ?";
            $stmt = mysqli_prepare($db_connection, $query);
            mysqli_stmt_bind_param($stmt, "i", $id);
            mysqli_stmt_execute($stmt);
            $result = mysqli_stmt_get_result($stmt);
            
            if ($row = mysqli_fetch_assoc($result)) {
                http_response_code(201);
                echo json_encode($row);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Erro ao recuperar o registro criado']);
            }
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Erro ao criar registro: ' . mysqli_error($db_connection)]);
        }
        break;
        
    case 'PUT':
        // Atualizar um registro existente
        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'ID não fornecido']);
            break;
        }
        
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!$data) {
            http_response_code(400);
            echo json_encode(['error' => 'Dados inválidos ou ausentes']);
            break;
        }
        
        // Verificar se o registro existe
        $check_query = "SELECT * FROM equipamentos WHERE id = ? AND excluido = 'N'";
        $stmt = mysqli_prepare($db_connection, $check_query);
        mysqli_stmt_bind_param($stmt, "i", $id);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        
        if (!mysqli_fetch_assoc($result)) {
            http_response_code(404);
            echo json_encode(['error' => 'Registro não encontrado']);
            break;
        }
        
        // Construir a query de atualização dinamicamente
        $update_fields = [];
        $types = "";
        $params = [];
        
        // Mapeamento de campos
        $field_mappings = [
            'nome_equipamento' => ['s', $data['nome_equipamento'] ?? null],
            'placa_patrimonio' => ['s', $data['placa_patrimonio'] ?? null],
            'filial' => ['i', $data['filial'] ?? null],
            'setor' => ['s', $data['setor'] ?? null],
            'destino' => ['s', $data['destino'] ?? null],
            'data_abertura' => ['s', $data['data_abertura'] ?? null],
            'data_entrega' => ['s', $data['data_entrega'] ?? null],
            'data_devolucao' => ['s', $data['data_devolucao'] ?? null],
            'status' => ['s', $data['status'] ?? null],
            'observacao' => ['s', $data['observacao'] ?? null],
            'imagem' => ['s', $data['imagem'] ?? null]
        ];
        
        foreach ($field_mappings as $field => $field_data) {
            list($type, $value) = $field_data;
            
            if ($value !== null) {
                $update_fields[] = "$field = ?";
                $types .= $type;
                $params[] = $value;
            }
        }
        
        if (empty($update_fields)) {
            http_response_code(400);
            echo json_encode(['error' => 'Nenhum campo para atualizar']);
            break;
        }
        
        // Adicionar o ID para a condição WHERE
        $types .= "i";
        $params[] = $id;
        
        $query = "UPDATE equipamentos SET " . implode(", ", $update_fields) . " WHERE id = ?";
        $stmt = mysqli_prepare($db_connection, $query);
        
        // Bind parameters
        mysqli_stmt_bind_param($stmt, $types, ...$params);
        
        if (mysqli_stmt_execute($stmt)) {
            // Retornar o registro atualizado
            $query = "SELECT * FROM equipamentos WHERE id = ?";
            $stmt = mysqli_prepare($db_connection, $query);
            mysqli_stmt_bind_param($stmt, "i", $id);
            mysqli_stmt_execute($stmt);
            $result = mysqli_stmt_get_result($stmt);
            
            if ($row = mysqli_fetch_assoc($result)) {
                echo json_encode($row);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Erro ao recuperar o registro atualizado']);
            }
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Erro ao atualizar registro: ' . mysqli_error($db_connection)]);
        }
        break;
        
    case 'DELETE':
        // Excluir logicamente um registro
        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'ID não fornecido']);
            break;
        }
        
        // Verificar se o registro existe
        $check_query = "SELECT * FROM equipamentos WHERE id = ? AND excluido = 'N'";
        $stmt = mysqli_prepare($db_connection, $check_query);
        mysqli_stmt_bind_param($stmt, "i", $id);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        
        if (!mysqli_fetch_assoc($result)) {
            http_response_code(404);
            echo json_encode(['error' => 'Registro não encontrado']);
            break;
        }
        
        // Exclusão lógica
        $query = "UPDATE equipamentos SET excluido = 'S' WHERE id = ?";
        $stmt = mysqli_prepare($db_connection, $query);
        mysqli_stmt_bind_param($stmt, "i", $id);
        
        if (mysqli_stmt_execute($stmt)) {
            echo json_encode(['success' => true, 'message' => 'Registro excluído com sucesso']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Erro ao excluir registro: ' . mysqli_error($db_connection)]);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Método não permitido']);
        break;
}

// Fechar a conexão
mysqli_close($db_connection);
?>
