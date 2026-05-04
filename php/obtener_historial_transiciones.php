<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
include 'db_conexion.php';

$vendedor_ci = $_SESSION['ci_usuario'] ?? null;
if (!$vendedor_ci) {
    echo json_encode(["status" => "error", "message" => "Acceso denegado. Sesión no encontrada."]);
    exit;
}

try {
    $sql = "SELECT id_transicion, codigo_producto, producto_nombre, lote_agotado, lote_nuevo, fecha_transicion 
            FROM historial_transiciones_lote 
            ORDER BY fecha_transicion DESC";
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $historial = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(["status" => "success", "historial" => $historial]);

} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Error de base de datos: " . $e->getMessage()]);
}
?>
