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

if (
    !empty($data->name) &&
    !empty($data->email) &&
    !empty($data->phone) &&
    !empty($data->username) &&
    !empty($data->password)
) {
    try {
        // Check for duplicate email or username
        $check_query = "SELECT id FROM users WHERE email = :email OR username = :username";
        $check_stmt = $conn->prepare($check_query);
        $check_stmt->bindParam(':email', $data->email);
        $check_stmt->bindParam(':username', $data->username);
        $check_stmt->execute();

        if ($check_stmt->rowCount() > 0) {
            http_response_code(400);
            echo json_encode(array("message" => "Email or username already exists."));
            exit();
        }

        // Insert new user
        $query = "INSERT INTO users (name, email, phone, username, password_hash) VALUES (:name, :email, :phone, :username, :password_hash)";
        $stmt = $conn->prepare($query);

        $name = htmlspecialchars(strip_tags($data->name));
        $email = htmlspecialchars(strip_tags($data->email));
        $phone = htmlspecialchars(strip_tags($data->phone));
        $username = htmlspecialchars(strip_tags($data->username));
        $password_hash = password_hash($data->password, PASSWORD_BCRYPT);

        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':phone', $phone);
        $stmt->bindParam(':username', $username);
        $stmt->bindParam(':password_hash', $password_hash);

        if ($stmt->execute()) {
            http_response_code(201);
            echo json_encode(array("message" => "User registered successfully."));
        } else {
            http_response_code(503);
            echo json_encode(array("message" => "Unable to register user."));
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
