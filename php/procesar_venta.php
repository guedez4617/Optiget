<?php
// 1. Iniciar sesión ANTES de cualquier salida de texto
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// 2. Cabeceras
header('Content-Type: application/json');

// 3. Conexión
include 'db_conexion.php';

// 4. Capturar entrada
$input = file_get_contents("php://input");
$data = json_decode($input, true);

if (!$data) {
    echo json_encode(["status" => "error", "mensaje" => "No se recibieron datos válidos"]);
    exit;
}

$carrito = $data['carrito'] ?? [];
$metodoPago = $data['metodo_pago'] ?? 'Efectivo';
$cliente = $data['cliente'] ?? null;

// 5. Nombre del empleado
$vendedor = $_SESSION['nombre_usuario'] ?? 'Empleado General';

/**
 * 6. LIMPIAR CÉDULA
 * Importante: No usar intval() para no perder ceros o formatos si la BD es VARCHAR
 */
$ci_cliente = ($cliente && isset($cliente['cedula'])) ? trim($cliente['cedula']) : '999';

if (empty($carrito)) {
    echo json_encode(["status" => "error", "mensaje" => "El carrito está vacío"]);
    exit;
}

try {
    $pdo->beginTransaction();

    // 7. INSERTAR CABECERA
    $sqlFactura = "INSERT INTO factura (fecha, hora, ci_cliente, nombre_empleado, tipo_pago) 
                    VALUES (CURDATE(), CURTIME(), ?, ?, ?)";
    $stmtFact = $pdo->prepare($sqlFactura);
    $stmtFact->execute([$ci_cliente, $vendedor, $metodoPago]);
    
    $idFacturaReal = $pdo->lastInsertId();

    // 8. INSERTAR DETALLES
    foreach ($carrito as $item) {
        $codigoOriginal = trim((string)$item['codigo']);
        
        // Lógica de códigos manuales o especiales
        // CAMBIO CLAVE: Quitamos intval(). El código se queda como STRING.
        $esManual = (strpos($codigoOriginal, 'MANUAL-') !== false || $codigoOriginal === "0" || $codigoOriginal === "999");
        $codigoFinal = $codigoOriginal; 

        $cantidad = intval($item['cantidadFactura']);
        $precio = floatval($item['precio']);
        $subtotal = $cantidad * $precio;

        // INSERTAR EN DETALLE
        $sqlDetalle = "INSERT INTO det_factura (id_factura, codigo_producto, cantidad, sub_total) 
                        VALUES (?, ?, ?, ?)";
        $stmtDet = $pdo->prepare($sqlDetalle);
        $stmtDet->execute([
            $idFacturaReal, 
            $codigoFinal, // Ahora enviará "00000123" completo
            $cantidad,
            $subtotal
        ]);

        // 9. DESCONTAR STOCK
        // Solo si no es un código de ajuste manual
        if ($codigoFinal !== "0" && $codigoFinal !== "999" && !$esManual) {
            $sqlStock = "UPDATE productos SET unidades = unidades - ? 
                        WHERE Codigo = ? AND unidades >= ?";
            $stmtS = $pdo->prepare($sqlStock);
            $stmtS->execute([$cantidad, $codigoFinal, $cantidad]);

            // Auto-Inactivar si llega a cero
            $sqlAutoInactivar = "UPDATE productos SET estado = 0 
                                WHERE Codigo = ? AND unidades <= 0";
            $stmtAuto = $pdo->prepare($sqlAutoInactivar);
            $stmtAuto->execute([$codigoFinal]);
        }
    }

    $pdo->commit();
    echo json_encode(["status" => "ok", "id_factura" => (int)$idFacturaReal]);

} catch (Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    // Este mensaje te dirá ahora si el error persiste por otra causa
    echo json_encode(["status" => "error", "mensaje" => "Error en servidor: " . $e->getMessage()]);
}