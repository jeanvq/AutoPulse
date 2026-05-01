<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

require_once "../config/db.php";

$user_id = $_GET["user_id"] ?? null;
$lat     = $_GET["lat"] ?? null;
$lon     = $_GET["lon"] ?? null;

if (!$user_id || !$lat || !$lon) {
    echo json_encode(["success" => false, "message" => "Missing parameters"]);
    exit;
}

// Obtener temperatura actual de Open-Meteo
$url = "https://api.open-meteo.com/v1/forecast?latitude={$lat}&longitude={$lon}&current_weather=true";
$response = file_get_contents($url);
$data = json_decode($response, true);

if (!$data || !isset($data['current_weather'])) {
    echo json_encode(["success" => false, "message" => "Could not fetch weather"]);
    exit;
}

$temp = $data['current_weather']['temperature'];
$notifications = [];

// Generar alertas según temperatura
if ($temp <= -10) {
    // Verificar si ya existe esta alerta hoy
    $stmt = $pdo->prepare("SELECT id FROM notifications WHERE user_id = ? AND type = 'battery' AND DATE(created_at) = CURDATE()");
    $stmt->execute([$user_id]);
    if (!$stmt->fetch()) {
        $pdo->prepare("INSERT INTO notifications (user_id, title, message, type) VALUES (?, '🔋 Battery Alert', 'Temperature is below -10°C. Cold weather can reduce battery performance by up to 40%. Consider a battery check.', 'battery')")->execute([$user_id]);
        $notifications[] = 'battery';
    }
}

if ($temp <= 8) {
    // Alerta de llantas de invierno
    $stmt = $pdo->prepare("SELECT id FROM notifications WHERE user_id = ? AND type = 'winter_tires' AND DATE(created_at) = CURDATE()");
    $stmt->execute([$user_id]);
    if (!$stmt->fetch()) {
        $pdo->prepare("INSERT INTO notifications (user_id, title, message, type) VALUES (?, '❄️ Winter Tires Reminder', 'Temperature is at or below 7°C. Time to switch to winter tires for safer driving.', 'winter_tires')")->execute([$user_id]);
        $notifications[] = 'winter_tires';
    }
}

if ($temp <= 0) {
    // Alerta de limpiaparabrisas
    $stmt = $pdo->prepare("SELECT id FROM notifications WHERE user_id = ? AND type = 'washer_fluid' AND DATE(created_at) = CURDATE()");
    $stmt->execute([$user_id]);
    if (!$stmt->fetch()) {
        $pdo->prepare("INSERT INTO notifications (user_id, title, message, type) VALUES (?, '🧴 Washer Fluid Alert', 'Freezing temperatures detected. Make sure your washer fluid is rated for -40°C.', 'washer_fluid')")->execute([$user_id]);
        $notifications[] = 'washer_fluid';
    }
}

echo json_encode([
    "success" => true,
    "temperature" => $temp,
    "notifications_added" => $notifications
]);
?>