<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

require_once "../config/db.php";

$data = json_decode(file_get_contents("php://input"), true);

$notif_id = $data["notif_id"] ?? null;
$user_id  = $data["user_id"] ?? null;

if (!$notif_id || !$user_id) {
    echo json_encode(["success" => false, "message" => "Missing required fields"]);
    exit;
}

$stmt = $pdo->prepare("DELETE FROM notifications WHERE id = ? AND user_id = ?");
$stmt->execute([$notif_id, $user_id]);

echo json_encode(["success" => true]);
?>