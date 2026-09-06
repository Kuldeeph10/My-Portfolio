<?php
// backend/config.php

$host = 'localhost';
$db_name = 'portfolio_db';
$username = 'root'; // Default XAMPP username
$password = ''; // Default XAMPP password is empty

try {
    $conn = new PDO("mysql:host={$host};dbname={$db_name}", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $exception) {
    echo "Connection error: " . $exception->getMessage();
}
?>
