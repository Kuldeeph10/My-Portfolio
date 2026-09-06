<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once 'config.php';

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->identifier) && !empty($data->password)) {
    try {
        // Find user by username OR phone
        $query = "SELECT id, name, username, role, password_hash FROM users WHERE username = :identifier OR phone = :identifier";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(':identifier', $data->identifier);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            // Verify password
            if (password_verify($data->password, $user['password_hash'])) {
                
                // Don't send the hash back
                unset($user['password_hash']);
                
                http_response_code(200);
                echo json_encode(array(
                    "message" => "Login successful.",
                    "user" => $user
                ));
            } else {
                http_response_code(401);
                echo json_encode(array("message" => "Invalid password."));
            }
        } else {
            http_response_code(404);
            echo json_encode(array("message" => "User not found."));
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(array("message" => "Database error.", "error" => $e->getMessage()));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Incomplete data."));
}
?>
