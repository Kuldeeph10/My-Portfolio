<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once 'config.php';

$token = isset($_GET['token']) ? $_GET['token'] : '';

if (!$token) {
    echo json_encode(["unread" => false]);
    exit();
}

try {
    $stmt = $conn->prepare("SELECT c.id FROM clients c JOIN client_sessions s ON c.id = s.client_id WHERE s.token = :token AND s.expires_at > NOW()");
    $stmt->execute([':token' => $token]);
    $client = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$client) {
        echo json_encode(["unread" => false]);
        exit();
    }

    $unreadStmt = $conn->prepare("SELECT COUNT(*) as unread_count FROM chats WHERE client_id = :id AND sender = 'admin' AND is_read = 0");
    $unreadStmt->execute([':id' => $client['id']]);
    $res = $unreadStmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode(["unread" => $res['unread_count'] > 0]);
} catch(PDOException $e) {
    echo json_encode(["unread" => false]);
}
?>
