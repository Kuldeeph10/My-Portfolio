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

if (!empty($data->id) && !empty($data->action)) {
    try {
        if ($data->action === 'delete') {
            $query = "DELETE FROM contacts WHERE id = :id";
            $stmt = $conn->prepare($query);
            $stmt->bindParam(':id', $data->id);
            $stmt->execute();
            
            http_response_code(200);
            echo json_encode(array("message" => "Message deleted."));
        } else if ($data->action === 'read') {
            $query = "UPDATE contacts SET status = 'read' WHERE id = :id";
            $stmt = $conn->prepare($query);
            $stmt->bindParam(':id', $data->id);
            $stmt->execute();
            
            http_response_code(200);
            echo json_encode(array("message" => "Message marked as read."));
        } else {
            http_response_code(400);
            echo json_encode(array("message" => "Invalid action."));
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
