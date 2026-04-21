<?php
$host     = "TU_HOST";
$dbname   = "TU_DB_NAME";
$username = "TU_USERNAME";
$password = "TU_PASSWORD";

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    die(json_encode(["error" => "Connection failed: " . $e->getMessage()]));
}
?>