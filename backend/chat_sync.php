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
    http_response_code(400);
    echo json_encode(["message" => "Token required"]);
    exit();
}

try {
    // Authenticate client
    $stmt = $conn->prepare("SELECT c.id FROM clients c JOIN client_sessions s ON c.id = s.client_id WHERE s.token = :token AND s.expires_at > NOW()");
    $stmt->execute([':token' => $token]);
    $client = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$client) {
        http_response_code(401);
        echo json_encode(["message" => "Unauthorized"]);
        exit();
    }

    $client_id = $client['id'];

    // Update last_seen_at for client
    $upd = $conn->prepare("UPDATE clients SET last_seen_at = NOW() WHERE id = :id");
    $upd->execute([':id' => $client_id]);

    // Mark messages as read where sender is admin
    $updRead = $conn->prepare("UPDATE chats SET is_read = 1 WHERE client_id = :id AND sender = 'admin' AND is_read = 0");
    $updRead->execute([':id' => $client_id]);

    // Fetch messages
    $msgStmt = $conn->prepare("SELECT * FROM chats WHERE client_id = :id ORDER BY created_at ASC");
    $msgStmt->execute([':id' => $client_id]);
    $messages = $msgStmt->fetchAll(PDO::FETCH_ASSOC);

    // Get Admin status (online within last 10 seconds, and typing to this client)
    $admStmt = $conn->prepare("SELECT * FROM admin_status WHERE id = 1");
    $admStmt->execute();
    $admin_status = $admStmt->fetch(PDO::FETCH_ASSOC);

    $is_admin_online = false;
    $is_admin_typing = false;

    if ($admin_status) {
        $lastSeenTime = strtotime($admin_status['last_seen_at']);
        if ((time() - $lastSeenTime) < 10) {
            $is_admin_online = true;
        }
        if ($is_admin_online && $admin_status['is_typing_to'] == $client_id) {
            $is_admin_typing = true;
        }
    }

    http_response_code(200);
    echo json_encode([
        "messages" => $messages,
        "admin_online" => $is_admin_online,
        "admin_typing" => $is_admin_typing
    ]);

} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(["message" => "Database error.", "error" => $e->getMessage()]);
}
?>
