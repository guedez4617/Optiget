<?php
include 'db_conexion.php';
try {
    $pdo->exec("ALTER TABLE datos_negocio ADD COLUMN detalles_auditoria TEXT NULL");
    echo "Success";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
