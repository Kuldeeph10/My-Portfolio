<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once 'config.php';

$data = json_decode(file_get_contents("php://input"));

$token = isset($data->token) ? $data->token : '';
$admin_auth = isset($data->admin_auth) ? $data->admin_auth : false;
$is_typing = isset($data->is_typing) ? filter_var($data->is_typing, FILTER_VALIDATE_BOOLEAN) : false;

try {
    if ($admin_auth) {
        $client_id = isset($data->client_id) ? intval($data->client_id) : null;
        if ($is_typing && $client_id) {
            $upd = $conn->prepare("UPDATE admin_status SET last_seen_at = NOW(), is_typing_to = :id WHERE id = 1");
            $upd->execute([':id' => $client_id]);
        } else {
            $upd = $conn->prepare("UPDATE admin_status SET last_seen_at = NOW(), is_typing_to = NULL WHERE id = 1");
            $upd->execute();
        }
        http_response_code(200);
        echo json_encode(["message" => "Admin status updated"]);
    } elseif ($token) {
        $stmt = $conn->prepare("SELECT c.id FROM clients c JOIN client_sessions s ON c.id = s.client_id WHERE s.token = :token AND s.expires_at > NOW()");
        $stmt->execute([':token' => $token]);
        $client = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($client) {
            $val = $is_typing ? 1 : 0;
            $upd = $conn->prepare("UPDATE clients SET is_typing = :val, last_seen_at = NOW() WHERE id = :id");
            $upd->execute([':val' => $val, ':id' => $client['id']]);
            
            http_response_code(200);
            echo json_encode(["message" => "Typing status updated"]);
        } else {
            http_response_code(401);
            echo json_encode(["message" => "Unauthorized"]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["message" => "Invalid request"]);
    }
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(["message" => "Database error.", "error" => $e->getMessage()]);
}
?>
