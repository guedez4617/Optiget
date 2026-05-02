<?php
include 'c:/xampp/htdocs/Optiget/php/db_conexion.php';

try {
    $sql = "CREATE TABLE IF NOT EXISTS `lotes_producto` (
      `id_lote` int(11) NOT NULL AUTO_INCREMENT,
      `codigo_producto` varchar(50) NOT NULL,
      `numero_lote` varchar(50) NOT NULL,
      `fecha_caducidad` date NOT NULL,
      `cantidad` int(11) NOT NULL,
      `fecha_ingreso` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (`id_lote`),
      KEY `fk_lote_producto` (`codigo_producto`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;";

    $pdo->exec($sql);
    echo "Tabla lotes_producto creada exitosamente.";
} catch (PDOException $e) {
    echo "Error creando tabla: " . $e->getMessage();
}
?>
