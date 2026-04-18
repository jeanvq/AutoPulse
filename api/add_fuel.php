<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

require_once "../config/db.php";

$data = json_decode(file_get_contents("php://input"), true);

$vehicle_id  = $data["vehicle_id"] ?? null;
$user_id     = $data["user_id"] ?? null;
$date        = $data["date"] ?? null;
$amount      = $data["amount"] ?? null;
$cost        = $data["cost"] ?? null;
$km          = $data["km"] ?? null;
$odometer    = $data["odometer"] ?? null;
$station     = trim($data["station"] ?? "");

if (!$vehicle_id || !$user_id || !$date || !$amount || !$cost) {
    echo json_encode(["success" => false, "message" => "Missing required fields"]);
    exit;
}

$stmt = $pdo->prepare("
    INSERT INTO fuel_records (vehicle_id, user_id, date, amount, cost, km, odometer, station)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
");
$stmt->execute([$vehicle_id, $user_id, $date, $amount, $cost, $km, $odometer, $station]);

echo json_encode([
    "success" => true,
    "message" => "Fuel record saved successfully"
]);
?>