<?php
include_once 'config.php';
try {
    $conn->exec("ALTER TABLE portfolio_settings MODIFY setting_value TEXT");
    echo "Success";
} catch (Exception $e) {
    echo $e->getMessage();
}
?>
