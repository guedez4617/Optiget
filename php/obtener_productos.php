<?php
header('Content-Type: application/json');
include 'db_conexion.php';

try {
    // Traemos i.v.a. como tieneIva para evitar problemas con los puntos en JS
    $stmt = $pdo->query("SELECT codigo, categoria, marca, nombre, unidades, precio, `i.v.a.` AS tieneIva FROM productos");
    $productos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($productos);
} catch (PDOException $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
?>