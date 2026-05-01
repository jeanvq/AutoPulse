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

// ===== ALERTAS POR TEMPERATURA =====

// -20°C o menos → Batería crítica
if ($temp <= -20) {
    $stmt = $pdo->prepare("SELECT id FROM notifications WHERE user_id = ? AND type = 'battery_critical' AND DATE(created_at) = CURDATE()");
    $stmt->execute([$user_id]);
    if (!$stmt->fetch()) {
        $pdo->prepare("INSERT INTO notifications (user_id, title, message, type) VALUES (?, '🔋 Critical Battery Warning', 'Temperature is {$temp}°C. Extreme cold can prevent your car from starting. Consider using a block heater tonight.', 'battery_critical')")->execute([$user_id]);
        $notifications[] = 'battery_critical';
    }
}
// -10°C o menos → Batería débil
elseif ($temp <= -10) {
    $stmt = $pdo->prepare("SELECT id FROM notifications WHERE user_id = ? AND type = 'battery' AND DATE(created_at) = CURDATE()");
    $stmt->execute([$user_id]);
    if (!$stmt->fetch()) {
        $pdo->prepare("INSERT INTO notifications (user_id, title, message, type) VALUES (?, '🔋 Battery Alert', 'Temperature is {$temp}°C. Cold weather reduces battery performance by up to 40%. Let your car warm up before driving.', 'battery')")->execute([$user_id]);
        $notifications[] = 'battery';
    }
}

// -5°C o menos → Presión de llantas
if ($temp <= -5) {
    $stmt = $pdo->prepare("SELECT id FROM notifications WHERE user_id = ? AND type = 'tire_pressure' AND DATE(created_at) = CURDATE()");
    $stmt->execute([$user_id]);
    if (!$stmt->fetch()) {
        $pdo->prepare("INSERT INTO notifications (user_id, title, message, type) VALUES (?, '🌡️ Check Tire Pressure', 'Temperature is {$temp}°C. Cold air reduces tire pressure. Check your tires before driving for better fuel efficiency and safety.', 'tire_pressure')")->execute([$user_id]);
        $notifications[] = 'tire_pressure';
    }
}

// 0°C o menos → Limpiaparabrisas
if ($temp <= 0) {
    $stmt = $pdo->prepare("SELECT id FROM notifications WHERE user_id = ? AND type = 'washer_fluid' AND DATE(created_at) = CURDATE()");
    $stmt->execute([$user_id]);
    if (!$stmt->fetch()) {
        $pdo->prepare("INSERT INTO notifications (user_id, title, message, type) VALUES (?, '🧴 Washer Fluid Check', 'Freezing temperature detected ({$temp}°C). Make sure your washer fluid is rated for -40°C to avoid it freezing in the lines.', 'washer_fluid')")->execute([$user_id]);
        $notifications[] = 'washer_fluid';
    }
}

// 3°C o menos → Riesgo de hielo
if ($temp <= 3) {
    $stmt = $pdo->prepare("SELECT id FROM notifications WHERE user_id = ? AND type = 'ice_warning' AND DATE(created_at) = CURDATE()");
    $stmt->execute([$user_id]);
    if (!$stmt->fetch()) {
        $pdo->prepare("INSERT INTO notifications (user_id, title, message, type) VALUES (?, '❄️ Ice Risk on Roads', 'Temperature is near freezing ({$temp}°C). Watch out for black ice especially on bridges and shaded areas. Drive carefully!', 'ice_warning')")->execute([$user_id]);
        $notifications[] = 'ice_warning';
    }
}

echo json_encode([
    "success" => true,
    "temperature" => $temp,
    "notifications_added" => $notifications
]);
?>