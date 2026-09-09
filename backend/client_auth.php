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
$action = isset($_GET['action']) ? $_GET['action'] : '';

if ($action === 'register') {
    if (!empty($data->name) && !empty($data->username) && !empty($data->phone) && !empty($data->password)) {
        try {
            $name = htmlspecialchars(strip_tags($data->name));
            $username = htmlspecialchars(strip_tags($data->username));
            $phone = htmlspecialchars(strip_tags($data->phone));
            $password_hash = password_hash($data->password, PASSWORD_BCRYPT);
            
            // Check if username exists
            $stmt = $conn->prepare("SELECT id FROM clients WHERE username = :username");
            $stmt->execute([':username' => $username]);
            if ($stmt->fetch()) {
                http_response_code(400);
                echo json_encode(["message" => "Username already exists."]);
                exit();
            }

            $query = "INSERT INTO clients (name, username, phone, password_hash) VALUES (:name, :username, :phone, :password_hash)";
            $stmt = $conn->prepare($query);
            
            if ($stmt->execute([':name' => $name, ':username' => $username, ':phone' => $phone, ':password_hash' => $password_hash])) {
                $client_id = $conn->lastInsertId();
                $token = bin2hex(random_bytes(32));
                
                $sess_query = "INSERT INTO client_sessions (client_id, token, expires_at) VALUES (:client_id, :token, DATE_ADD(NOW(), INTERVAL 30 DAY))";
                $sess_stmt = $conn->prepare($sess_query);
                $sess_stmt->execute([':client_id' => $client_id, ':token' => $token]);

                http_response_code(201);
                echo json_encode(["message" => "Registered successfully.", "token" => $token, "client" => ["id" => $client_id, "name" => $name, "username" => $username]]);
            } else {
                http_response_code(503);
                echo json_encode(["message" => "Unable to register."]);
            }
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(["message" => "Database error.", "error" => $e->getMessage()]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["message" => "Incomplete data."]);
    }
} elseif ($action === 'login') {
    if (!empty($data->username) && !empty($data->password)) {
        try {
            $username = htmlspecialchars(strip_tags($data->username));
            
            $stmt = $conn->prepare("SELECT * FROM clients WHERE username = :username");
            $stmt->execute([':username' => $username]);
            $client = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($client && password_verify($data->password, $client['password_hash'])) {
                $token = bin2hex(random_bytes(32));
                $sess_query = "INSERT INTO client_sessions (client_id, token, expires_at) VALUES (:client_id, :token, DATE_ADD(NOW(), INTERVAL 30 DAY))";
                $sess_stmt = $conn->prepare($sess_query);
                $sess_stmt->execute([':client_id' => $client['id'], ':token' => $token]);

                http_response_code(200);
                unset($client['password_hash']);
                echo json_encode(["message" => "Login successful.", "token" => $token, "client" => $client]);
            } else {
                http_response_code(401);
                echo json_encode(["message" => "Invalid credentials."]);
            }
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(["message" => "Database error.", "error" => $e->getMessage()]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["message" => "Incomplete data."]);
    }
} elseif ($action === 'validate') {
    if (!empty($data->token)) {
        try {
            $stmt = $conn->prepare("SELECT c.* FROM clients c JOIN client_sessions s ON c.id = s.client_id WHERE s.token = :token AND s.expires_at > NOW()");
            $stmt->execute([':token' => $data->token]);
            $client = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($client) {
                // Update last_seen_at
                $upd = $conn->prepare("UPDATE clients SET last_seen_at = NOW() WHERE id = :id");
                $upd->execute([':id' => $client['id']]);

                http_response_code(200);
                unset($client['password_hash']);
                echo json_encode(["valid" => true, "client" => $client]);
            } else {
                http_response_code(401);
                echo json_encode(["valid" => false]);
            }
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(["message" => "Database error."]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["valid" => false]);
    }
} elseif ($action === 'update_profile') {
    if (!empty($data->token)) {
        $stmt = $conn->prepare("SELECT c.id FROM clients c JOIN client_sessions s ON c.id = s.client_id WHERE s.token = :token AND s.expires_at > NOW()");
        $stmt->execute([':token' => $data->token]);
        $client = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($client) {
            $name = isset($data->name) ? htmlspecialchars(strip_tags($data->name)) : null;
            $about = isset($data->about) ? htmlspecialchars(strip_tags($data->about)) : null;
            $profile_image = isset($data->profile_image) ? htmlspecialchars(strip_tags($data->profile_image)) : null;

            $updateFields = [];
            $params = [':id' => $client['id']];
            if ($name !== null) { $updateFields[] = "name = :name"; $params[':name'] = $name; }
            if ($about !== null) { $updateFields[] = "about = :about"; $params[':about'] = $about; }
            if ($profile_image !== null) { $updateFields[] = "profile_image = :img"; $params[':img'] = $profile_image; }

            if (count($updateFields) > 0) {
                $query = "UPDATE clients SET " . implode(", ", $updateFields) . " WHERE id = :id";
                $upd = $conn->prepare($query);
                $upd->execute($params);
            }

            http_response_code(200);
            echo json_encode(["message" => "Profile updated."]);
        } else {
            http_response_code(401);
            echo json_encode(["message" => "Unauthorized"]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["message" => "No token provided"]);
    }
} else {
    http_response_code(404);
    echo json_encode(["message" => "Action not found."]);
}
?>
