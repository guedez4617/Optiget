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

if (!isset($data['id_lote']) || !isset($data['nueva_cantidad'])) {
    echo json_encode(["status" => "error", "message" => "Faltan datos obligatorios para editar el lote."]);
    exit;
}

$id_lote = intval($data['id_lote']);
$nueva_cantidad = intval($data['nueva_cantidad']);

if ($nueva_cantidad < 0) {
    echo json_encode(["status" => "error", "message" => "La cantidad no puede ser negativa."]);
    exit;
}

try {
    $pdo->beginTransaction();

    // 1. Obtener información actual del lote
    $sql_info = "SELECT codigo_producto, numero_lote, cantidad FROM lotes_producto WHERE id_lote = ?";
    $stmt_info = $pdo->prepare($sql_info);
    $stmt_info->execute([$id_lote]);
    $lote = $stmt_info->fetch(PDO::FETCH_ASSOC);

    if (!$lote) {
        throw new Exception("El lote no existe.");
    }

    $codigo = $lote['codigo_producto'];
    $numero_lote = $lote['numero_lote'];
    $cantidad_vieja = intval($lote['cantidad']);
    $diferencia = $nueva_cantidad - $cantidad_vieja;

    if ($nueva_cantidad === 0) {
        // 2. Si es cero, eliminar lote
        $sql_del = "DELETE FROM lotes_producto WHERE id_lote = ?";
        $stmt_del = $pdo->prepare($sql_del);
        $stmt_del->execute([$id_lote]);
        
        $accion = "ELIMINACION LOTE (VÍA EDICIÓN)";
        $detalles = "Lote [$numero_lote] eliminado por ajuste a cero. Stock restado: $cantidad_vieja.";
    } else {
        // 2. Si es mayor a cero, actualizar lote
        $sql_upd_lote = "UPDATE lotes_producto SET cantidad = ? WHERE id_lote = ?";
        $stmt_upd_lote = $pdo->prepare($sql_upd_lote);
        $stmt_upd_lote->execute([$nueva_cantidad, $id_lote]);
        
        $accion = "EDICION LOTE";
        $cambio_texto = $diferencia >= 0 ? "Sumado: $diferencia" : "Restado: " . abs($diferencia);
        $detalles = "Edición de cantidad en Lote [$numero_lote]: $cantidad_vieja -> $nueva_cantidad. Stock ajustado ($cambio_texto).";
    }

    // 3. Actualizar stock general en la tabla productos
    if ($diferencia !== 0) {
        $sql_upd_prod = "UPDATE productos SET unidades = unidades + ? WHERE Codigo = ?";
        $stmt_upd_prod = $pdo->prepare($sql_upd_prod);
        $stmt_upd_prod->execute([$diferencia, $codigo]);
    }

    // 4. Registrar en historial
    $sqlLog = "INSERT INTO historial_productos (codigo_producto, accion, usuario_ci, detalles, fecha) 
                VALUES (?, ?, ?, ?, NOW())";
    $stmtLog = $pdo->prepare($sqlLog);
    $stmtLog->execute([$codigo, $accion, $vendedor_ci, $detalles]);

    $pdo->commit();

    echo json_encode(["status" => "success", "message" => ($nueva_cantidad === 0 ? "Lote eliminado (stock agotado)." : "Cantidad actualizada correctamente.")]);

} catch (Exception $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    echo json_encode(["status" => "error", "message" => "Error: " . $e->getMessage()]);
}
?>
