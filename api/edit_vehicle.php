<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

require_once "../config/db.php";

$data = json_decode(file_get_contents("php://input"), true);

$user_id      = $data["user_id"] ?? null;
$vehicle_id   = $data["vehicle_id"] ?? null;
$vin          = strtoupper(trim($data["vin"] ?? ""));
$make         = trim($data["make"] ?? "");
$model        = trim($data["model"] ?? "");
$year         = $data["year"] ?? null;
$trim         = trim($data["trim"] ?? "");
$color        = trim($data["color"] ?? "");
$mileage      = $data["mileage"] ?? null;
$category     = trim($data["category"] ?? "");
$description  = trim($data["description"] ?? "");

// Validaciones
if (!$user_id || !$vehicle_id || !$make || !$model || !$year) {
    echo json_encode(["success" => false, "message" => "Missing required fields"]);
    exit;
}

// Verificar si el VIN ya existe para otro vehículo de este usuario
if ($vin) {
    $stmt = $pdo->prepare("SELECT id FROM vehicles WHERE vin = ? AND user_id = ? AND id != ?");
    $stmt->execute([$vin, $user_id, $vehicle_id]);
    if ($stmt->fetch()) {
        echo json_encode(["success" => false, "message" => "This VIN is registered to another vehicle"]);
        exit;
    }
}

// Actualizar el vehículo
$stmt = $pdo->prepare("
    UPDATE vehicles 
    SET vin = ?, make = ?, model = ?, year = ?, trim = ?, color = ?, mileage = ?, category = ?, description = ?
    WHERE id = ? AND user_id = ?
");
$stmt->execute([$vin, $make, $model, $year, $trim, $color, $mileage, $category, $description, $vehicle_id, $user_id]);

echo json_encode([
    "success" => true,
    "message" => "Vehicle updated successfully"
]);
?>
