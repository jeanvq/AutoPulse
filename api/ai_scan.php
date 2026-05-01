<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"), true);

$imageData  = $data["image"] ?? null;
$mediaType  = $data["media_type"] ?? "image/jpeg";

if (!$imageData) {
    echo json_encode(["success" => false, "message" => "No image provided"]);
    exit;
}

$apiKey = getenv('ANTHROPIC_API_KEY');

if (!$apiKey) {
    echo json_encode(["success" => false, "message" => "API key not configured"]);
    exit;
}

$payload = [
    "model" => "claude-haiku-4-5-20251001",
    "max_tokens" => 1000,
    "messages" => [
        [
            "role" => "user",
            "content" => [
                [
                    "type" => "image",
                    "source" => [
                        "type" => "base64",
                        "media_type" => $mediaType,
                        "data" => $imageData
                    ]
                ],
                [
                    "type" => "text",
                    "text" => "You are an expert automotive technician. Analyze this dashboard warning light image and provide:\n1. **What light is this?** - Name of the warning light\n2. **What does it mean?** - Clear explanation\n3. **Severity** - 🔴 Critical, 🟡 Warning, or 🟢 Info\n4. **What to do** - Recommended action steps\n\nBe concise and helpful."
                ]
            ]
        ]
    ]
];

$ch = curl_init("https://api.anthropic.com/v1/messages");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Content-Type: application/json",
    "x-api-key: " . $apiKey,
    "anthropic-version: 2023-06-01"
]);

$response = curl_exec($ch);
curl_close($ch);

$result = json_decode($response, true);

if (isset($result['content'][0]['text'])) {
    echo json_encode([
        "success" => true,
        "analysis" => $result['content'][0]['text']
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Could not analyze image",
        "debug" => $result
    ]);
}
?>