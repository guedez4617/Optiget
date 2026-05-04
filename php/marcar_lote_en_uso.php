<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
include 'db_conexion.php';

$vendedor_ci = $_SESSION['ci_usuario'] ?? null;

if (!$vendedor_ci) {
    echo json_encode(["status" => "error", "message" => "Acceso denegado. Sesión no encontrada."]);
    exit;
}

$input = file_get_contents("php://input");
$data = json_decode($input, true);

if (!isset($data['id_lote']) || !isset($data['codigo_producto'])) {
    echo json_encode(["status" => "error", "message" => "Datos obligatorios faltantes."]);
    exit;
}

$id_lote = intval($data['id_lote']);
$codigo = trim($data['codigo_producto']);

try {
    $pdo->beginTransaction();

    // Reset all lots for this product
    $stmt_reset = $pdo->prepare("UPDATE lotes_producto SET en_uso = 0 WHERE codigo_producto = ?");
    $stmt_reset->execute([$codigo]);

    // Set the specific lot to en_uso = 1
    $stmt_set = $pdo->prepare("UPDATE lotes_producto SET en_uso = 1 WHERE id_lote = ?");
    $stmt_set->execute([$id_lote]);

    $pdo->commit();
    echo json_encode(["status" => "success", "message" => "Lote marcado en uso correctamente."]);

} catch (PDOException $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    echo json_encode(["status" => "error", "message" => "Error de base de datos: " . $e->getMessage()]);
}
?>
