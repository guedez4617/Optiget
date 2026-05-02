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

if (!isset($data['codigo']) || !isset($data['fecha_caducidad']) || !isset($data['cantidad'])) {
    echo json_encode(["status" => "error", "message" => "Faltan datos obligatorios para agregar el lote."]);
    exit;
}

$codigo = trim($data['codigo']);
$fecha_caducidad = trim($data['fecha_caducidad']);
$cantidad = intval($data['cantidad']);

if ($cantidad <= 0) {
    echo json_encode(["status" => "error", "message" => "La cantidad debe ser mayor a 0."]);
    exit;
}

try {
    $pdo->beginTransaction();

    // 1. Obtener todos los lotes del producto
    $stmt_lotes = $pdo->prepare("SELECT numero_lote FROM lotes_producto WHERE codigo_producto = ?");
    $stmt_lotes->execute([$codigo]);
    $lotes_existentes = $stmt_lotes->fetchAll(PDO::FETCH_COLUMN);

    $max_corr = 0;
    foreach ($lotes_existentes as $l) {
        $partes = explode('-', $l);
        if (count($partes) >= 3) {
            $corr_actual = intval($partes[count($partes) - 2]);
            if ($corr_actual > $max_corr) {
                $max_corr = $corr_actual;
            }
        }
    }

    $nuevo_corr = $max_corr + 1;
    $corr_str = str_pad($nuevo_corr, 3, '0', STR_PAD_LEFT);

    // 2. Formatear Fecha (YYMMDD)
    if ($fecha_caducidad === '9999-12-31') {
        $fecha_str = "000000";
    } else {
        $fecha_obj = new DateTime($fecha_caducidad);
        $fecha_str = $fecha_obj->format('ymd');
    }

    // 3. Ensamblar
    $numero_lote = "$codigo-$corr_str-$fecha_str";

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
    $vence_txt = ($fecha_caducidad === '9999-12-31') ? "No vence" : $fecha_caducidad;
    $detalles = "Nuevo lote agregado: $numero_lote. Cantidad: $cantidad. Vence: $vence_txt.";
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
