<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

require_once "../config/db.php";

$data = json_decode(file_get_contents("php://input"), true);

$vehicle_id = $data["vehicle_id"] ?? null;
$user_id    = $data["user_id"] ?? null;

if (!$vehicle_id || !$user_id) {
    echo json_encode(["success" => false, "message" => "Missing required fields"]);
    exit;
}

// Verificar que el vehículo pertenece al usuario
$stmt = $pdo->prepare("SELECT id FROM vehicles WHERE id = ? AND user_id = ?");
$stmt->execute([$vehicle_id, $user_id]);
if (!$stmt->fetch()) {
    echo json_encode(["success" => false, "message" => "Vehicle not found"]);
    exit;
}

// Eliminar el vehículo
$stmt = $pdo->prepare("DELETE FROM vehicles WHERE id = ? AND user_id = ?");
$stmt->execute([$vehicle_id, $user_id]);

echo json_encode([
    "success" => true,
    "message" => "Vehicle deleted successfully"
]);
?>