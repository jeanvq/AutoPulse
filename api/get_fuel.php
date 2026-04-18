<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

require_once "../config/db.php";

$vehicle_id = $_GET["vehicle_id"] ?? null;
$user_id    = $_GET["user_id"] ?? null;

if (!$vehicle_id || !$user_id) {
    echo json_encode(["success" => false, "message" => "Missing required fields"]);
    exit;
}

$stmt = $pdo->prepare("
    SELECT * FROM fuel_records 
    WHERE vehicle_id = ? AND user_id = ? 
    ORDER BY date DESC
");
$stmt->execute([$vehicle_id, $user_id]);
$records = $stmt->fetchAll();

echo json_encode([
    "success" => true,
    "records" => $records
]);
?>