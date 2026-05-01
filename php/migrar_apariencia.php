<?php
include 'db_conexion.php';
try {
    $pdo->exec("ALTER TABLE datos_negocio 
        ADD COLUMN IF NOT EXISTS color_tema VARCHAR(20) DEFAULT '#c54b00',
        ADD COLUMN IF NOT EXISTS fondo_sistema VARCHAR(255) DEFAULT 'frente.png',
        ADD COLUMN IF NOT EXISTS logo_sistema VARCHAR(255) DEFAULT 'Picsart_25-11-28_15-24-13-139.png'
    ");
    echo "Columnas de apariencia añadidas correctamente.";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
