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

if (!isset($data['codigo']) || !isset($data['numero_lote']) || !isset($data['fecha_caducidad']) || !isset($data['cantidad'])) {
    echo json_encode(["status" => "error", "message" => "Faltan datos obligatorios para agregar el lote."]);
    exit;
}

$codigo = trim($data['codigo']);
$numero_lote = trim($data['numero_lote']);
$fecha_caducidad = trim($data['fecha_caducidad']);
$cantidad = intval($data['cantidad']);

if ($cantidad <= 0) {
    echo json_encode(["status" => "error", "message" => "La cantidad debe ser mayor a 0."]);
    exit;
}

try {
    $pdo->beginTransaction();

    // Insertar el lote
    $sql_lote = "INSERT INTO lotes_producto (codigo_producto, numero_lote, fecha_caducidad, cantidad) 
                 VALUES (?, ?, ?, ?)";
    $stmt_lote = $pdo->prepare($sql_lote);
    $stmt_lote->execute([$codigo, $numero_lote, $fecha_caducidad, $cantidad]);

    // Actualizar stock general en la tabla productos
    $sql_upd = "UPDATE productos SET unidades = unidades + ?, estado = 1 WHERE Codigo = ?";
    $stmt_upd = $pdo->prepare($sql_upd);
    $stmt_upd->execute([$cantidad, $codigo]);

    // Historial
    $detalles = "Nuevo lote agregado: $numero_lote. Cantidad: $cantidad. Vence: $fecha_caducidad.";
    $sqlLog = "INSERT INTO historial_productos (codigo_producto, accion, usuario_ci, detalles, fecha) 
                VALUES (?, 'INGRESO LOTE', ?, ?, NOW())";
    $stmtLog = $pdo->prepare($sqlLog);
    $stmtLog->execute([$codigo, $vendedor_ci, $detalles]);

    $pdo->commit();

    echo json_encode(["status" => "success", "message" => "Lote agregado correctamente."]);

} catch (PDOException $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    echo json_encode(["status" => "error", "message" => "Error de base de datos: " . $e->getMessage()]);
}
?>
