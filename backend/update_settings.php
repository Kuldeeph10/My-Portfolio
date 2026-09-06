<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once 'config.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!empty($data) && is_array($data)) {
    try {
        $conn->beginTransaction();
        
        $query = "INSERT INTO portfolio_settings (setting_key, setting_value) VALUES (:key, :val) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)";
        $stmt = $conn->prepare($query);

        foreach ($data as $key => $value) {
            $stmt->bindValue(':key', $key);
            $stmt->bindValue(':val', $value);
            $stmt->execute();
        }

        $conn->commit();
        http_response_code(200);
        echo json_encode(array("message" => "Settings updated successfully."));
    } catch (PDOException $e) {
        $conn->rollBack();
        http_response_code(500);
        echo json_encode(array("message" => "Database error.", "error" => $e->getMessage()));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Invalid data."));
}
?>
