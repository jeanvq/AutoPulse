<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

require_once "../config/db.php";

$data = json_decode(file_get_contents("php://input"), true);
$user_id = $data["user_id"] ?? null;

if (!$user_id) {
    echo json_encode(["success" => false]);
    exit;
}

$stmt = $pdo->prepare("UPDATE notifications SET is_read = 1 WHERE user_id = ?");
$stmt->execute([$user_id]);

echo json_encode(["success" => true]);
?>