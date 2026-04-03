<?php
header('Content-Type: application/json');
include 'db_conexion.php'; // Verifica que la ruta sea correcta

$q = isset($_GET['q']) ? $_GET['q'] : '';

try {
    if ($q !== '') {
        // Usamos backticks para Codigo e i.v.a. por los puntos y mayúsculas
        $sql = "SELECT `Codigo` AS codigo, 
                       `nombre`, 
                       `precio`, 
                       `i.v.a.` AS iva, 
                       `unidades` 
                FROM productos 
                WHERE (`Codigo` LIKE ? OR `nombre` LIKE ?) 
                AND `unidades` > 0 
                LIMIT 15";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute(["%$q%", "%$q%"]);
        $productos = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode($productos);
    } else {
        echo json_encode([]);
    }
} catch (PDOException $e) {
    echo json_encode(["error" => "Error de base de datos: " . $e->getMessage()]);
}
?>