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

if (!empty($data->name) && !empty($data->email) && !empty($data->phone) && !empty($data->message)) {
    try {
        // Validation
        $name = trim($data->name);
        $email = trim($data->email);
        $phone = trim($data->phone);
        $message = trim($data->message);
        
        // Strict Email Validation
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode(array("message" => "Invalid email format."));
            exit();
        }

        // Strict Phone Validation (Only digits, +, -, spaces allowed, 10-15 chars)
        if (!preg_match('/^[0-9\+\-\s]{10,15}$/', $phone)) {
            http_response_code(400);
            echo json_encode(array("message" => "Invalid phone number format."));
            exit();
        }

        // Sanitization against XSS
        $name = htmlspecialchars(strip_tags($name));
        $email = htmlspecialchars(strip_tags($email));
        $phone = htmlspecialchars(strip_tags($phone));
        $message = htmlspecialchars(strip_tags($message));

        $query = "INSERT INTO contacts (name, email, phone, message, status) VALUES (:name, :email, :phone, :message, 'unread')";
        $stmt = $conn->prepare($query);
        
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':phone', $phone);
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
