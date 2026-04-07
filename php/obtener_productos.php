<?php
header('Content-Type: application/json; charset=utf-8');
include 'db_conexion.php';

$verInactivos = (isset($_GET['inactivos']) && $_GET['inactivos'] === 'true');

try {
    if ($verInactivos) {
        // Agregamos: AND Codigo <> '0' para excluir el Monto Adicional
        $sql = "SELECT Codigo, categoria, marca, nombre, Presentacion, unidades, precio, `I.v.a.` AS tieneIva 
                FROM productos 
                WHERE estado = 0 AND Codigo <> '0'";
    } else {
        // Agregamos: AND Codigo <> '0' para excluir el Monto Adicional
        $sql = "SELECT Codigo, categoria, marca, nombre, Presentacion, unidades, precio, `I.v.a.` AS tieneIva 
                FROM productos 
                WHERE estado = 1 AND Codigo <> '0'";
    }
            
    $stmt = $pdo->query($sql);
    $productos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode($productos);
} catch (PDOException $e) {
    echo json_encode(["error" => $e->getMessage()]);
}