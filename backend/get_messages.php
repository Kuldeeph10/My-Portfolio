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
    $query = "SELECT id, name, email, phone, message, status, created_at FROM contacts ORDER BY created_at DESC";
    $stmt = $conn->prepare($query);
    $stmt->execute();

    $messages = array();
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $messages[] = $row;
    }

    http_response_code(200);
    echo json_encode($messages);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(array("message" => "Database error.", "error" => $e->getMessage()));
}
?>
