<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

require_once "../config/db.php";

$data = json_decode(file_get_contents("php://input"), true);

$record_id = $data["record_id"] ?? null;
$user_id   = $data["user_id"] ?? null;

if (!$record_id || !$user_id) {
    echo json_encode(["success" => false, "message" => "Missing required fields"]);
    exit;
}

$stmt = $pdo->prepare("DELETE FROM fuel_records WHERE id = ? AND user_id = ?");
$stmt->execute([$record_id, $user_id]);

echo json_encode(["success" => true, "message" => "Fuel record deleted"]);
?>