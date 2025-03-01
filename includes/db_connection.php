
<?php
// Arquivo de conexão com o banco de dados
require_once 'config.php';

function conectarBD() {
    global $hostname, $database, $username, $password;
    
    try {
        $conn = new PDO("mysql:host=$hostname;dbname=$database", $username, $password);
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        return $conn;
    } catch(PDOException $e) {
        echo '<div class="alert alert-danger">Erro ao conectar com o banco de dados: ' . $e->getMessage() . '</div>';
        return null;
    }
}
