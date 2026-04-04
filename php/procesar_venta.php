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

// 6. Limpiar cédula
$ci_limpia = ($cliente && isset($cliente['cedula'])) ? preg_replace('/[^0-9]/', '', $cliente['cedula']) : '';
$ci_cliente = (empty($ci_limpia)) ? 999 : intval($ci_limpia);

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
        $esManual = (isset($item['codigo']) && strpos((string)$item['codigo'], 'MANUAL-') !== false);
        $codigoFinal = $esManual ? 0 : intval($item['codigo']); 
        $cantidad = intval($item['cantidadFactura']);
        $precio = floatval($item['precio']);
        $subtotal = $cantidad * $precio;

        $sqlDetalle = "INSERT INTO det_factura (id_factura, codigo_producto, cantidad, sub_total) 
                        VALUES (?, ?, ?, ?)";
        $stmtDet = $pdo->prepare($sqlDetalle);
        $stmtDet->execute([
            $idFacturaReal, 
            $codigoFinal,
            $cantidad,
            $subtotal
        ]);

        // 9. DESCONTAR STOCK Y AUTO-INACTIVAR
        if (!$esManual && $codigoFinal > 0) {
            // Restamos las unidades
            $sqlStock = "UPDATE productos SET unidades = unidades - ? 
                        WHERE Codigo = ? AND unidades >= ?";
            $stmtS = $pdo->prepare($sqlStock);
            $stmtS->execute([$cantidad, $codigoFinal, $cantidad]);

            // CAMBIO CLAVE: Si el producto llegó a 0, lo pasamos a estado 0 (Inactivo)
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
    echo json_encode(["status" => "error", "mensaje" => "Error en servidor: " . $e->getMessage()]);
}