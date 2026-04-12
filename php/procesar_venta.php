<?php
session_start(); // Fundamental para capturar quién está logueado
header('Content-Type: application/json');
include 'db_conexion.php';

// 1. Verificar que el usuario esté logueado
$vendedor_ci = $_SESSION['ci_usuario'] ?? null;

if (!$vendedor_ci) {
    echo json_encode(["status" => "error", "mensaje" => "Sesión expirada. Inicie sesión nuevamente."]);
    exit;
}

// 2. Leer los datos enviados por el JS
$input = json_decode(file_get_contents("php://input"), true);
if (!$input) {
    echo json_encode(["status" => "error", "mensaje" => "No se recibieron datos"]);
    exit;
}

$carrito = $input['carrito'];
$metodo = $input['metodo_pago'];
$tasa = $input['tasa'];
$cedula_cliente = $input['cliente']['cedula'];

try {
    $pdo->beginTransaction();

    // 3. Insertar la Cabecera de la Factura
    // Nota: Usamos 'usuario_ci' para guardar la relación con el empleado logueado
    $sql_factura = "INSERT INTO factura (fecha, hora, ci_cliente, tipo_pago, usuario_ci) 
                    VALUES (CURDATE(), CURTIME(), ?, ?, ?)";
    $stmt = $pdo->prepare($sql_factura);
    $stmt->execute([$cedula_cliente, $metodo, $vendedor_ci]);
    
    $id_factura = $pdo->lastInsertId();

    // 4. Insertar los productos en det_factura y actualizar stock
    $sql_det = "INSERT INTO det_factura (id_factura, codigo_producto, cantidad, sub_total, total_bs) 
                VALUES (?, ?, ?, ?, ?)";
    $stmt_det = $pdo->prepare($sql_det);

    $sql_stock = "UPDATE productos SET unidades = unidades - ? WHERE Codigo = ?";
    $stmt_stock = $pdo->prepare($sql_stock);

    foreach ($carrito as $item) {
        // Cálculo de subtotal en base a lo que viene del carrito
        $subtotal_usd = $item['precio'] * $item['cantidadFactura'];
        
        $stmt_det->execute([
            $id_factura,
            $item['codigo'],
            $item['cantidadFactura'],
            $subtotal_usd,
            $item['total_bs']
        ]);

        // No restamos stock si es el "Monto Adicional" (código 0)
        if ($item['codigo'] !== "0") {
            $stmt_stock->execute([$item['cantidadFactura'], $item['codigo']]);
        }
    }

    $pdo->commit();
    echo json_encode(["status" => "ok", "id_factura" => $id_factura]);

} catch (Exception $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    echo json_encode(["status" => "error", "mensaje" => "Error DB: " . $e->getMessage()]);
}
?>