<?php
include 'db_conexion.php';
try {
    $sql = "CREATE TABLE IF NOT EXISTS `historial_transiciones_lote` (
      `id_transicion` int(11) NOT NULL AUTO_INCREMENT,
      `codigo_producto` varchar(50) NOT NULL,
      `producto_nombre` varchar(255) NOT NULL,
      `lote_agotado` varchar(50) NOT NULL,
      `lote_nuevo` varchar(50) NOT NULL,
      `fecha_transicion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (`id_transicion`),
      KEY `fk_transicion_producto` (`codigo_producto`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;";
    $pdo->exec($sql);
    echo "Tabla historial_transiciones_lote creada exitosamente.";
} catch (PDOException $e) {
    echo "Error creando tabla: " . $e->getMessage();
}
?>
