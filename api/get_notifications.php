<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

require_once "../config/db.php";

$user_id = $_GET["user_id"] ?? null;

if (!$user_id) {
    echo json_encode(["success" => false, "message" => "User ID required"]);
    exit;
}

// Generar notificaciones automáticas
// 1. Notificación de bienvenida si no existe
$stmt = $pdo->prepare("SELECT id FROM notifications WHERE user_id = ? AND type = 'welcome'");
$stmt->execute([$user_id]);
if (!$stmt->fetch()) {
    $pdo->prepare("INSERT INTO notifications (user_id, title, message, type) VALUES (?, 'Welcome to AutoPulse! 🚗', 'Start by adding your first vehicle using the VIN lookup feature.', 'welcome')")->execute([$user_id]);
}

// Obtener todas las notificaciones
$stmt = $pdo->prepare("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20");
$stmt->execute([$user_id]);
$notifications = $stmt->fetchAll();

// Contar no leídas
$stmt = $pdo->prepare("SELECT COUNT(*) as unread FROM notifications WHERE user_id = ? AND is_read = 0");
$stmt->execute([$user_id]);
$unread = $stmt->fetch()['unread'];

echo json_encode([
    "success" => true,
    "notifications" => $notifications,
    "unread" => $unread
]);
?>