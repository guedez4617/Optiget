<?php
header('Content-Type: application/json; charset=utf-8');
include 'db_conexion.php';

$verInactivos = (isset($_GET['inactivos']) && $_GET['inactivos'] === 'true');

try {
    if ($verInactivos) {
        // Aquí aparecerán: 
        // 1. Los que borraste tú.
        // 2. Los que se agotaron solos (unidades = 0).
        $sql = "SELECT codigo, categoria, marca, nombre, unidades, precio, `i.v.a.` AS tieneIva 
                FROM productos 
                WHERE estado = 0";
    } else {
        // Aquí solo verás lo que tiene stock y está activo.
        $sql = "SELECT codigo, categoria, marca, nombre, unidades, precio, `i.v.a.` AS tieneIva 
                FROM productos 
                WHERE estado = 1";
    }
            
    $stmt = $pdo->query($sql);
    $productos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode($productos);
} catch (PDOException $e) {
    echo json_encode(["error" => $e->getMessage()]);
}