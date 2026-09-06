<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once 'config.php';

try {
    $query = "SELECT setting_key, setting_value FROM portfolio_settings";
    $stmt = $conn->prepare($query);
    $stmt->execute();

    $settings = array();
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $settings[$row['setting_key']] = $row['setting_value'];
    }

    http_response_code(200);
    echo json_encode($settings);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(array("message" => "Database error.", "error" => $e->getMessage()));
}
?>
