<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once 'config.php';

$action = isset($_GET['action']) ? $_GET['action'] : '';

try {
    if ($action === 'get_clients') {
        // Fetch clients with unread count, last message, and online status
        $query = "
            SELECT 
                c.id, c.name, c.username, c.profile_image, c.last_seen_at, c.is_typing,
                (SELECT COUNT(*) FROM chats WHERE client_id = c.id AND sender = 'client' AND is_read = 0) as unread_count,
                (SELECT message_text FROM chats WHERE client_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
                (SELECT created_at FROM chats WHERE client_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message_time
            FROM clients c
            ORDER BY last_message_time DESC, c.last_seen_at DESC
        ";
        
        $stmt = $conn->prepare($query);
        $stmt->execute();
        $clients = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Process online status
        foreach ($clients as &$client) {
            $lastSeen = strtotime($client['last_seen_at']);
            $client['is_online'] = (time() - $lastSeen) < 10;
        }

        http_response_code(200);
        echo json_encode($clients);
        
    } elseif ($action === 'get_messages') {
        $client_id = isset($_GET['client_id']) ? intval($_GET['client_id']) : 0;
        
        if ($client_id) {
            // Update admin last seen
            $updAdmin = $conn->prepare("UPDATE admin_status SET last_seen_at = NOW() WHERE id = 1");
            $updAdmin->execute();

            // Mark client messages as read
            $updRead = $conn->prepare("UPDATE chats SET is_read = 1 WHERE client_id = :id AND sender = 'client' AND is_read = 0");
            $updRead->execute([':id' => $client_id]);

            // Fetch messages
            $msgStmt = $conn->prepare("SELECT * FROM chats WHERE client_id = :id ORDER BY created_at ASC");
            $msgStmt->execute([':id' => $client_id]);
            $messages = $msgStmt->fetchAll(PDO::FETCH_ASSOC);

            // Fetch client online/typing status
            $cliStmt = $conn->prepare("SELECT last_seen_at, is_typing FROM clients WHERE id = :id");
            $cliStmt->execute([':id' => $client_id]);
            $client = $cliStmt->fetch(PDO::FETCH_ASSOC);
            
            $is_client_online = false;
            if ($client) {
                $is_client_online = (time() - strtotime($client['last_seen_at'])) < 10;
            }

            http_response_code(200);
            echo json_encode([
                "messages" => $messages,
                "client_online" => $is_client_online,
                "client_typing" => $client && $client['is_typing']
            ]);
        } else {
            http_response_code(400);
            echo json_encode(["message" => "client_id required"]);
        }
    } elseif ($action === 'clear_chat') {
        $data = json_decode(file_get_contents("php://input"));
        $client_id = isset($data->client_id) ? intval($data->client_id) : 0;
        
        if ($client_id) {
            $del = $conn->prepare("DELETE FROM chats WHERE client_id = :id");
            $del->execute([':id' => $client_id]);
            http_response_code(200);
            echo json_encode(["message" => "Chat cleared"]);
        } else {
            http_response_code(400);
            echo json_encode(["message" => "client_id required"]);
        }
    } else {
        http_response_code(404);
        echo json_encode(["message" => "Action not found"]);
    }
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(["message" => "Database error.", "error" => $e->getMessage()]);
}
?>
