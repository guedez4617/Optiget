<?php
include 'db_conexion.php';
try {
    $pdo->exec("ALTER TABLE lotes_producto ADD COLUMN en_uso TINYINT DEFAULT 0;");
    echo "Columna en_uso añadida exitosamente.";
} catch (PDOException $e) {
    if (strpos($e->getMessage(), "Duplicate column name") !== false) {
        echo "La columna ya existe.";
    } else {
        echo "Error: " . $e->getMessage();
    }
}
?>
