<?php
include 'db_conexion.php';
try {
    $pdo->exec("ALTER TABLE lotes_producto ADD COLUMN IF NOT EXISTS estado_lote VARCHAR(20) DEFAULT 'Activo'");
    echo 'Alter successful';
} catch (Exception $e) {
    // MySQL older versions don't support IF NOT EXISTS in ALTER TABLE
    if (strpos($e->getMessage(), 'Duplicate column name') !== false) {
        echo 'Column already exists';
    } else {
        echo $e->getMessage();
    }
}
?>
