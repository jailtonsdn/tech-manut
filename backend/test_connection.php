
<?php
// Configurações do banco de dados
$hostname = "localhost";
$username = "kalbir85_patrimonio";
$password = "Kalbir@1705!#";
$database = "kalbir85_patrimonio";

// Cria a conexão
$db_connection = mysqli_connect($hostname, $username, $password, $database);

// Verifica a conexão
if (!$db_connection) {
    die("Conexão falhou: " . mysqli_connect_error());
}

echo "Conexão com o banco de dados realizada com sucesso!";

// Testa uma consulta simples
$query = "SELECT * FROM equipamentos LIMIT 5";
$result = mysqli_query($db_connection, $query);

if ($result) {
    echo "<br>Consulta realizada com sucesso!<br>";
    echo "<pre>";
    while ($row = mysqli_fetch_assoc($result)) {
        print_r($row);
    }
    echo "</pre>";
} else {
    echo "<br>Erro na consulta: " . mysqli_error($db_connection);
}

// Fecha a conexão
mysqli_close($db_connection);
?>
