<?php
header("Content-Type: application/json");

$host     = getenv('MYSQLHOST');
$dbname   = getenv('MYSQLDATABASE');
$username = getenv('MYSQLUSER');
$password = getenv('MYSQLPASSWORD');
$port     = getenv('MYSQLPORT') ?: 3306;

echo json_encode([
    "host"     => $host,
    "dbname"   => $dbname,
    "username" => $username,
    "port"     => $port,
    "password" => $password ? "SET" : "NOT SET"
]);
?>