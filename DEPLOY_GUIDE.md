
# Guia de Implantação no Hostgator com MySQL

Este documento oferece instruções para implantar o Sistema de Manutenção no Hostgator e configurá-lo para usar MySQL.

## Requisitos

1. Uma conta Hostgator com:
   - Hospedagem compartilhada ou VPS
   - Suporte a PHP (7.4+)
   - Banco de dados MySQL
   - Acesso a cPanel

## Etapas para Implantação

### 1. Preparando o Banco de Dados

1. Acesse o cPanel do seu plano Hostgator
2. Localize a seção "Databases" e clique em "MySQL Databases"
3. Crie um novo banco de dados e anote o nome
4. Crie um novo usuário e senha para o banco de dados
5. Adicione o usuário ao banco de dados com todas as permissões

### 2. Criando a Estrutura do Banco de Dados

Aqui está o SQL para criar as tabelas necessárias. Execute isto no phpMyAdmin:

```sql
CREATE TABLE `users` (
  `id` varchar(36) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','user') NOT NULL DEFAULT 'user',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `maintenance_records` (
  `id` varchar(36) NOT NULL,
  `equipment_name` varchar(100) NOT NULL,
  `asset_tag` varchar(50) NOT NULL,
  `date_received` date NOT NULL,
  `date_sent_to_service` date DEFAULT NULL,
  `date_returned` date DEFAULT NULL,
  `status` enum('received','sent','completed') NOT NULL,
  `invoice_number` varchar(50) DEFAULT NULL,
  `value` decimal(10,2) DEFAULT NULL,
  `notes` text,
  `equipment_type` enum('ups','printer','computer') NOT NULL,
  `branch` varchar(100) DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `registered_by` varchar(36) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `registered_by` (`registered_by`),
  CONSTRAINT `maintenance_records_ibfk_1` FOREIGN KEY (`registered_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 3. Configurando o Backend (PHP)

1. Crie uma pasta `api` na raiz do seu domínio no Hostgator
2. Faça upload dos seguintes arquivos:

#### config.php
```php
<?php
// Configurações do Banco de Dados
define('DB_HOST', 'localhost');
define('DB_NAME', 'seu_banco_de_dados');
define('DB_USER', 'seu_usuario');
define('DB_PASS', 'sua_senha');

// Configurações da API
define('JWT_SECRET', 'chave_secreta_para_tokens'); // Mude isso para uma string aleatória
define('CORS_ORIGIN', '*'); // Em produção, defina para seu domínio específico

// Configurar timezone
date_default_timezone_set('America/Sao_Paulo');

// Configurar headers para CORS
header('Access-Control-Allow-Origin: ' . CORS_ORIGIN);
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

// Tratar requisições OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Função para conectar ao banco de dados
function getConnection() {
    try {
        $conn = new PDO(
            'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4',
            DB_USER,
            DB_PASS,
            [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
        );
        return $conn;
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Erro de conexão com o banco de dados']);
        exit;
    }
}
?>
```

#### api/index.php
```php
<?php
require_once '../config.php';

// Obter caminho da URL
$request_uri = $_SERVER['REQUEST_URI'];
$path = parse_url($request_uri, PHP_URL_PATH);
$path = str_replace('/api/', '', $path);
$segments = explode('/', $path);
$resource = $segments[0] ?? '';
$id = $segments[1] ?? null;
$method = $_SERVER['REQUEST_METHOD'];

// Obter dados do corpo da requisição
$data = json_decode(file_get_contents('php://input'), true) ?? [];

// Roteamento básico
switch ($resource) {
    case 'auth':
        include 'auth.php';
        break;
    case 'maintenance':
        include 'maintenance.php';
        break;
    default:
        http_response_code(404);
        echo json_encode(['error' => 'Recurso não encontrado']);
        break;
}
?>
```

#### api/auth.php
```php
<?php
// Implementar autenticação
// ...código de autenticação...
?>
```

#### api/maintenance.php
```php
<?php
require_once '../config.php';

$conn = getConnection();

switch ($method) {
    case 'GET':
        if ($id) {
            // Obter um registro específico
            $stmt = $conn->prepare("SELECT * FROM maintenance_records WHERE id = ?");
            $stmt->execute([$id]);
            $record = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($record) {
                echo json_encode($record);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Registro não encontrado']);
            }
        } else {
            // Obter todos os registros
            $stmt = $conn->query("SELECT * FROM maintenance_records ORDER BY created_at DESC");
            $records = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($records);
        }
        break;
        
    case 'POST':
        // Criar um novo registro
        $stmt = $conn->prepare("
            INSERT INTO maintenance_records (
                id, equipment_name, asset_tag, date_received, 
                status, equipment_type, branch, department,
                registered_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        $id = uniqid();
        $registered_by = "user_id"; // Substituir pelo ID real do usuário autenticado
        
        $stmt->execute([
            $id,
            $data['equipmentName'],
            $data['assetTag'],
            $data['dateReceived'],
            $data['status'],
            $data['equipmentType'],
            $data['branch'] ?? null,
            $data['department'] ?? null,
            $registered_by
        ]);
        
        $data['id'] = $id;
        echo json_encode($data);
        break;
        
    case 'PUT':
        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'ID não fornecido']);
            break;
        }
        
        // Atualizar um registro
        $fields = [];
        $values = [];
        
        // Mapear campos do frontend para o banco de dados
        $mapping = [
            'equipmentName' => 'equipment_name',
            'assetTag' => 'asset_tag',
            'dateReceived' => 'date_received',
            'dateSentToService' => 'date_sent_to_service',
            'dateReturned' => 'date_returned',
            'status' => 'status',
            'invoiceNumber' => 'invoice_number',
            'value' => 'value',
            'notes' => 'notes',
            'equipmentType' => 'equipment_type',
            'branch' => 'branch',
            'department' => 'department'
        ];
        
        foreach ($mapping as $frontendKey => $dbKey) {
            if (isset($data[$frontendKey])) {
                $fields[] = "$dbKey = ?";
                $values[] = $data[$frontendKey];
            }
        }
        
        if (empty($fields)) {
            http_response_code(400);
            echo json_encode(['error' => 'Nenhum campo para atualizar']);
            break;
        }
        
        $values[] = $id; // Para a cláusula WHERE
        
        $stmt = $conn->prepare("
            UPDATE maintenance_records 
            SET " . implode(', ', $fields) . "
            WHERE id = ?
        ");
        
        $stmt->execute($values);
        
        if ($stmt->rowCount() > 0) {
            // Obter o registro atualizado
            $stmt = $conn->prepare("SELECT * FROM maintenance_records WHERE id = ?");
            $stmt->execute([$id]);
            $record = $stmt->fetch(PDO::FETCH_ASSOC);
            echo json_encode($record);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Registro não encontrado ou nenhuma alteração feita']);
        }
        break;
        
    case 'DELETE':
        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'ID não fornecido']);
            break;
        }
        
        // Excluir um registro
        $stmt = $conn->prepare("DELETE FROM maintenance_records WHERE id = ?");
        $stmt->execute([$id]);
        
        if ($stmt->rowCount() > 0) {
            echo json_encode(['success' => true]);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Registro não encontrado']);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Método não permitido']);
        break;
}
?>
```

### 4. Implantando o Frontend React

Para implantar o frontend React no Hostgator:

1. Execute `npm run build` no seu computador local para gerar os arquivos de produção
2. Faça upload de todo o conteúdo da pasta `build` para a pasta pública do seu domínio no Hostgator (geralmente `public_html`)
3. Crie um arquivo `.htaccess` na raiz do seu domínio com o seguinte conteúdo:

```
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /index.html [L]
</IfModule>
```

### 5. Configurando o Frontend para Apontar para a API

Atualize o arquivo `src/config/api.ts` para apontar para a URL correta da sua API no Hostgator:

```typescript
// Configuração para conexão com a API backend
const API_CONFIG = {
  BASE_URL: process.env.NODE_ENV === 'production' 
    ? 'https://seudominio.com.br/api' // Substitua pelo seu domínio real
    : 'http://localhost:3000/api',
  TIMEOUT: 15000, // 15 segundos
};

export default API_CONFIG;
```

## Considerações de Segurança

1. Sempre utilize HTTPS para proteger as comunicações
2. Implemente autenticação JWT para proteger o acesso à API
3. Use prepared statements (como mostrado) para evitar injeção de SQL
4. Filtre e valide todos os dados de entrada
5. Não armazene senhas em texto plano, use bcrypt ou similar

## Solução de Problemas

- Se encontrar erros 500, verifique os logs de erro do PHP no cPanel
- Para erros de CORS, verifique as configurações de cabeçalho no arquivo config.php
- Para problemas de permissão, assegure-se de que as permissões de arquivo estejam corretas (geralmente 644 para arquivos e 755 para diretórios)
