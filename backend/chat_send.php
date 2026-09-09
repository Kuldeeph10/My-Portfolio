<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once 'config.php';

// Support both JSON (text only) and multipart/form-data (for files)
$data = [];
if ($_SERVER['CONTENT_TYPE'] && strpos($_SERVER['CONTENT_TYPE'], 'application/json') !== false) {
    $data = (array) json_decode(file_get_contents("php://input"));
} else {
    $data = $_POST;
}

$token = isset($data['token']) ? $data['token'] : '';
$admin_auth = isset($data['admin_auth']) ? $data['admin_auth'] : false; // basic check for portfolio
$message = isset($data['message']) ? htmlspecialchars(strip_tags($data['message'])) : '';
$client_id = null;
$sender = '';

try {
    if ($admin_auth) {
        $sender = 'admin';
        if (!isset($data['client_id'])) {
            http_response_code(400);
            echo json_encode(["message" => "client_id required for admin"]);
            exit();
        }
        $client_id = $data['client_id'];
    } elseif ($token) {
        $sender = 'client';
        $stmt = $conn->prepare("SELECT c.id FROM clients c JOIN client_sessions s ON c.id = s.client_id WHERE s.token = :token AND s.expires_at > NOW()");
        $stmt->execute([':token' => $token]);
        $client = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($client) {
            $client_id = $client['id'];
        } else {
            http_response_code(401);
            echo json_encode(["message" => "Unauthorized"]);
            exit();
        }
    } else {
        http_response_code(401);
        echo json_encode(["message" => "Unauthorized"]);
        exit();
    }

    $media_url = null;
    
    if (isset($_FILES['media']) && $_FILES['media']['error'] === UPLOAD_ERR_OK) {
        $uploadDir = 'uploads/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }
        
        $fileInfo = pathinfo($_FILES['media']['name']);
        $ext = strtolower($fileInfo['extension']);
        $allowed = ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'mp4'];
        
        if (in_array($ext, $allowed)) {
            $filename = uniqid() . '.' . $ext;
            $destination = $uploadDir . $filename;
            
            if (move_uploaded_file($_FILES['media']['tmp_name'], $destination)) {
                // Return relative path to backend
                $media_url = 'backend/' . $destination;
            }
        } else {
            http_response_code(400);
            echo json_encode(["message" => "File type not allowed"]);
            exit();
        }
    }

    if (empty($message) && empty($media_url)) {
        http_response_code(400);
        echo json_encode(["message" => "Message or media is required"]);
        exit();
    }

    $query = "INSERT INTO chats (client_id, sender, message_text, media_url) VALUES (:client_id, :sender, :message_text, :media_url)";
    $stmt = $conn->prepare($query);
    $stmt->execute([
        ':client_id' => $client_id,
        ':sender' => $sender,
        ':message_text' => $message,
        ':media_url' => $media_url
    ]);

    http_response_code(201);
    echo json_encode(["message" => "Message sent", "id" => $conn->lastInsertId()]);

} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(["message" => "Database error.", "error" => $e->getMessage()]);
}
?>
