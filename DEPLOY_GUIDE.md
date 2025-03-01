# Guia de Implantação no Hostgator e Publicação no GitHub

Este documento oferece instruções para implantar o Sistema de Manutenção no Hostgator e publicá-lo no GitHub.

## Parte 1: Publicando no GitHub

### Pré-requisitos

1. Uma conta no [GitHub](https://github.com/)
2. Git instalado em seu computador
3. Acesso aos arquivos do projeto

### Passo a Passo para Publicação no GitHub

1. **Criar um Repositório no GitHub**
   - Acesse sua conta no GitHub
   - Clique no botão "+" no canto superior direito e selecione "Novo repositório"
   - Dê um nome ao seu repositório (ex: "sistema-manutencao")
   - Escolha se o repositório será público ou privado
   - Clique em "Criar repositório"

2. **Preparar o Projeto para o GitHub**
   - Abra um terminal ou prompt de comando
   - Navegue até a pasta raiz do seu projeto
   ```bash
   cd caminho/para/seu/projeto
   ```
   - Inicialize um repositório Git local
   ```bash
   git init
   ```
   - Adicione todos os arquivos ao Git
   ```bash
   git add .
   ```
   - Crie o primeiro commit
   ```bash
   git commit -m "Commit inicial"
   ```

3. **Conectar e Enviar para o GitHub**
   - Conecte seu repositório local ao repositório remoto no GitHub
   ```bash
   git remote add origin https://github.com/seu-usuario/sistema-manutencao.git
   ```
   - Envie os arquivos para o GitHub
   ```bash
   git push -u origin main
   ```
   - Se estiver usando a branch "master" em vez de "main", substitua no comando acima

4. **Verificar a Publicação**
   - Acesse https://github.com/seu-usuario/sistema-manutencao
   - Confirme se todos os arquivos do projeto estão visíveis no repositório

## Parte 2: Implantação no Hostgator

### Requisitos

1. Uma conta Hostgator com:
   - Hospedagem compartilhada ou VPS
   - Suporte a PHP (7.4+)
   - Banco de dados MySQL
   - Acesso a cPanel

### Etapas para Implantação

#### 1. Preparando o Banco de Dados

1. Acesse o cPanel do seu plano Hostgator
2. Localize a seção "Bancos de Dados" e clique em "MySQL Databases"
3. Crie um novo banco de dados e anote o nome
4. Crie um novo usuário e senha para o banco de dados
5. Adicione o usuário ao banco de dados com todas as permissões

#### 2. Criando a Estrutura do Banco de Dados

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

CREATE TABLE `equipamentos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome_equipamento` varchar(100) NOT NULL,
  `placa_patrimonio` varchar(50) NOT NULL,
  `filial` int(11) NOT NULL,
  `setor` varchar(100) DEFAULT NULL,
  `destino` varchar(100) DEFAULT NULL,
  `data_abertura` date NOT NULL,
  `data_entrega` date DEFAULT NULL,
  `data_devolucao` date DEFAULT NULL,
  `status` enum('received','sent','completed') NOT NULL DEFAULT 'received',
  `observacao` text DEFAULT NULL,
  `imagem` varchar(255) DEFAULT NULL,
  `excluido` enum('S','N') NOT NULL DEFAULT 'N',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

#### 3. Configurando e Fazendo Upload dos Arquivos

1. **Prepare o Backend:**
   - Atualize o arquivo `config.php` com as configurações do seu banco de dados no Hostgator:
   ```php
   <?php
   // Configurações do banco de dados
   $hostname = "localhost"; // Geralmente é localhost no Hostgator
   $username = "seu_usuario_do_banco"; // Nome de usuário do MySQL que você criou
   $password = "sua_senha_do_banco"; // Senha que você definiu
   $database = "seu_banco_de_dados"; // Nome do banco de dados que você criou

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
   ```

2. **Prepare o Frontend (React):**
   - Atualize o arquivo `src/config/api.ts` para apontar para a URL do seu domínio:
   ```typescript
   const API_CONFIG = {
     BASE_URL: process.env.NODE_ENV === 'production' 
       ? 'https://seudominio.com.br/backend' // Substitua pelo seu domínio real
       : 'http://localhost:3000/api',
     TIMEOUT: 15000, // 15 segundos
   };
   
   export default API_CONFIG;
   ```

3. **Construa o Frontend:**
   - No seu ambiente de desenvolvimento, execute:
   ```bash
   npm run build
   ```
   - Isso irá gerar os arquivos de produção na pasta `dist`

4. **Faça Upload dos Arquivos:**
   - Acesse o Gerenciador de Arquivos do cPanel do seu domínio no Hostgator
   - Crie uma pasta chamada `backend` na raiz do seu domínio
   - Faça upload dos arquivos PHP (`config.php`, `backend/maintenance.php`, etc.) para a pasta `backend`
   - Faça upload de todos os arquivos da pasta `dist` para a pasta raiz do seu domínio (geralmente `public_html`)

5. **Configure o .htaccess:**
   - Crie um arquivo `.htaccess` na raiz do seu domínio com o seguinte conteúdo:
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

#### 4. Testando a Implantação

1. Acesse seu site através do navegador: `https://seudominio.com.br`
2. Verifique se o frontend está carregando corretamente
3. Teste a comunicação com o backend tentando carregar e salvar registros de manutenção
4. Verifique no console do navegador (F12) se há erros de conexão com a API

#### 5. Solução de Problemas Comuns

1. **Erro 404 no Frontend:**
   - Verifique se o arquivo `.htaccess` está configurado corretamente
   - Certifique-se de que os arquivos do frontend foram enviados para o diretório raiz

2. **Erro de Conexão com a API:**
   - Verifique se o caminho na configuração `API_CONFIG.BASE_URL` está correto
   - Confirme se os arquivos PHP foram enviados para a pasta correta

3. **Erro de Conexão com o Banco de Dados:**
   - Verifique as credenciais no arquivo `config.php`
   - Certifique-se de que o usuário tem permissões para acessar o banco de dados

4. **Erro 500 no Backend:**
   - Verifique os logs de erro do PHP no cPanel
   - Adicione um tratamento de erros mais detalhado nos scripts PHP

## Parte 3: Manutenção e Atualizações

### Atualizando o Sistema no GitHub

Após fazer alterações no sistema:

```bash
git add .
git commit -m "Descrição das alterações"
git push
```

### Atualizando o Sistema no Hostgator

Após atualizar o repositório no GitHub:

1. Se houver alterações no frontend:
   - Execute `npm run build` localmente
   - Faça upload dos novos arquivos da pasta `dist` para o Hostgator

2. Se houver alterações no backend:
   - Faça upload dos arquivos PHP atualizados para a pasta `backend` no Hostgator

3. Se houver alterações no banco de dados:
   - Execute os scripts SQL necessários através do phpMyAdmin no cPanel

## Considerações de Segurança

1. Não armazene senhas ou chaves de API diretamente no código
2. Utilize HTTPS para proteger a comunicação entre o frontend e o backend
3. Implemente validação adequada de dados de entrada no backend
4. Considere adicionar autenticação JWT para proteger suas APIs
5. Faça backup regular do banco de dados
