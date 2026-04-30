<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

require_once "../config/db.php";

$data = json_decode(file_get_contents("php://input"), true);

$vehicle_id = $data["vehicle_id"] ?? null;
$user_id    = $data["user_id"] ?? null;
$date       = $data["date"] ?? null;
$type       = trim($data["type"] ?? "");
$price      = $data["price"] ?? null;
$next_date  = $data["next_date"] ?? null;
$notes      = trim($data["notes"] ?? "");

if (!$vehicle_id || !$user_id || !$date || !$type || !$price) {
    echo json_encode(["success" => false, "message" => "Missing required fields"]);
    exit;
}

$stmt = $pdo->prepare("
    INSERT INTO maintenance_records (vehicle_id, user_id, date, type, price, next_date, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
");
$stmt->execute([$vehicle_id, $user_id, $date, $type, $price, $next_date ?: null, $notes]);

echo json_encode([
    "success" => true,
    "message" => "Maintenance record saved successfully"
]);
?>