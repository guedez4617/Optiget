<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
include 'db_conexion.php';

$vendedor_ci = $_SESSION['ci_usuario'] ?? null;

if (!$vendedor_ci) {
    echo json_encode(["status" => "error", "message" => "Acceso denegado. Sesión no encontrada."]);
    exit;
}

if (!isset($_GET['codigo'])) {
    echo json_encode(["status" => "error", "message" => "Código de producto no proporcionado."]);
    exit;
}

$codigo = trim($_GET['codigo']);

try {
    $sql = "SELECT id_lote, numero_lote, fecha_caducidad, cantidad, fecha_ingreso 
            FROM lotes_producto 
            WHERE codigo_producto = ? AND cantidad > 0 
            ORDER BY fecha_caducidad ASC";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$codigo]);
    $lotes = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(["status" => "success", "lotes" => $lotes]);

} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Error de base de datos: " . $e->getMessage()]);
}
?>
