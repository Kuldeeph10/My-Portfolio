<?php
// backend/contact.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once 'config.php';

// Get JSON POST body
$data = json_decode(file_get_contents("php://input"));

if (!empty($data->name) && !empty($data->email) && !empty($data->message)) {
    try {
        $query = "INSERT INTO contacts (name, email, message) VALUES (:name, :email, :message)";
        $stmt = $conn->prepare($query);
        
        $name = htmlspecialchars(strip_tags($data->name));
        $email = htmlspecialchars(strip_tags($data->email));
        $message = htmlspecialchars(strip_tags($data->message));
        
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':message', $message);
        
        if($stmt->execute()) {
            http_response_code(201);
            echo json_encode(array("message" => "Message sent successfully."));
        } else {
            http_response_code(503);
            echo json_encode(array("message" => "Unable to send message."));
        }
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(array("message" => "Database error.", "error" => $e->getMessage()));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Incomplete data."));
}
?>
