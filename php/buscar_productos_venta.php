<?php
header('Content-Type: application/json');
include 'db_conexion.php'; 

$q = isset($_GET['q']) ? $_GET['q'] : '';

try {
    if ($q !== '') {
        // Seleccionamos los campos exactos de tu tabla
        $sql = "SELECT `Codigo` AS codigo, 
                        `nombre`, 
                        `marca`, 
                        `presentacion`, 
                        `precio`, 
                        `i.v.a.` AS iva, 
                        `unidades` 
                FROM productos 
                WHERE (`Codigo` LIKE ? OR `nombre` LIKE ? OR `marca` LIKE ?) 
                AND `unidades` > 0 
                LIMIT 15";
        
        $stmt = $pdo->prepare($sql);
        // Ahora busca también por marca si el usuario escribe la marca
        $stmt->execute(["%$q%", "%$q%", "%$q%"]);
        $productos = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode($productos);
    } else {
        echo json_encode([]);
    }
} catch (PDOException $e) {
    echo json_encode(["error" => "Error de base de datos: " . $e->getMessage()]);
}
?>