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

if (!isset($data['id_lote'])) {
    echo json_encode(["status" => "error", "message" => "ID de lote no proporcionado."]);
    exit;
}

$id_lote = intval($data['id_lote']);

try {
    $pdo->beginTransaction();

    // Obtener información del lote
    $sql_info = "SELECT codigo_producto, numero_lote, cantidad FROM lotes_producto WHERE id_lote = ?";
    $stmt_info = $pdo->prepare($sql_info);
    $stmt_info->execute([$id_lote]);
    $lote = $stmt_info->fetch(PDO::FETCH_ASSOC);

    if (!$lote) {
        throw new Exception("El lote no existe.");
    }

    $codigo = $lote['codigo_producto'];
    $numero_lote = $lote['numero_lote'];
    $cantidad = intval($lote['cantidad']);

    // Eliminar el lote
    $sql_del = "DELETE FROM lotes_producto WHERE id_lote = ?";
    $stmt_del = $pdo->prepare($sql_del);
    $stmt_del->execute([$id_lote]);

    // Actualizar stock general
    if ($cantidad > 0) {
        $sql_upd = "UPDATE productos SET unidades = unidades - ? WHERE Codigo = ?";
        $stmt_upd = $pdo->prepare($sql_upd);
        $stmt_upd->execute([$cantidad, $codigo]);
    }
    
    // Registrar en historial
    $detalles = "Lote eliminado (Código: $numero_lote). Cantidad restada del inventario: $cantidad.";
    $sqlLog = "INSERT INTO historial_productos (codigo_producto, accion, usuario_ci, detalles, fecha) 
                VALUES (?, 'ELIMINACION LOTE', ?, ?, NOW())";
    $stmtLog = $pdo->prepare($sqlLog);
    $stmtLog->execute([$codigo, $vendedor_ci, $detalles]);

    $pdo->commit();

    echo json_encode(["status" => "success", "message" => "Lote eliminado correctamente."]);

} catch (Exception $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    echo json_encode(["status" => "error", "message" => "Error: " . $e->getMessage()]);
}
?>
