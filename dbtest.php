<?php
header("Content-Type: application/json");

$host     = getenv('MYSQLHOST');
$dbname   = "railway";
$username = getenv('MYSQLUSER');
$password = getenv('MYSQLPASSWORD');
$port     = getenv('MYSQLPORT') ?: 3306;

try {
    $pdo = new PDO("mysql:host=$host;port=$port;dbname=$dbname;charset=utf8mb4", $username, $password);
    echo json_encode(["success" => true, "message" => "Connected!"]);
} catch (PDOException $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
?>