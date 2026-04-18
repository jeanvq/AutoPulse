<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

require_once "../config/db.php";

$data = json_decode(file_get_contents("php://input"), true);

$user_id      = $data["user_id"] ?? null;
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
if (!$user_id || !$make || !$model || !$year) {
    echo json_encode(["success" => false, "message" => "Missing required fields"]);
    exit;
}

// Verificar si el VIN ya existe para este usuario
if ($vin) {
    $stmt = $pdo->prepare("SELECT id FROM vehicles WHERE vin = ? AND user_id = ?");
    $stmt->execute([$vin, $user_id]);
    if ($stmt->fetch()) {
        echo json_encode(["success" => false, "message" => "This vehicle is already registered"]);
        exit;
    }
}

// Guardar el vehículo
$stmt = $pdo->prepare("
    INSERT INTO vehicles (user_id, vin, make, model, year, trim, color, mileage, category, description)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
");
$stmt->execute([$user_id, $vin, $make, $model, $year, $trim, $color, $mileage, $category, $description]);

$newId = $pdo->lastInsertId();

echo json_encode([
    "success" => true,
    "message" => "Vehicle saved successfully",
    "vehicle_id" => $newId
]);
?>