<?php
session_start();
header('Content-Type: application/json');
include 'db_conexion.php';

$vendedor_ci = $_SESSION['ci_usuario'] ?? null;

if (!$vendedor_ci) {
    echo json_encode(["status" => "error", "mensaje" => "Sesión expirada. Inicie sesión nuevamente."]);
    exit;
}

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

    $stmtNegocio = $pdo->query("SELECT id_config FROM datos_negocio ORDER BY id_config DESC LIMIT 1");
    $config = $stmtNegocio->fetch(PDO::FETCH_ASSOC);

    if (!$config) {
        throw new Exception("No se encontraron datos del negocio. Configure el negocio en Ajustes primero.");
    }
    $id_negocio_actual = $config['id_config'];

    $sql_factura = "INSERT INTO factura (fecha, hora, ci_cliente, tipo_pago, usuario_ci, id_config_negocio) 
                    VALUES (CURDATE(), CURTIME(), ?, ?, ?, ?)";
    $stmt = $pdo->prepare($sql_factura);
    $stmt->execute([$cedula_cliente, $metodo, $vendedor_ci, $id_negocio_actual]);
    
    $id_factura = $pdo->lastInsertId();

    $sql_det = "INSERT INTO det_factura (id_factura, codigo_producto, cantidad, sub_total, total_bs) 
                VALUES (?, ?, ?, ?, ?)";
    $stmt_det = $pdo->prepare($sql_det);

    $sql_stock = "UPDATE productos SET unidades = unidades - ? WHERE Codigo = ?";
    $stmt_stock = $pdo->prepare($sql_stock);

    foreach ($carrito as $item) {
        $subtotal_usd = $item['precio'] * $item['cantidadFactura'];
        
        $stmt_det->execute([
            $id_factura,
            $item['codigo'],
            $item['cantidadFactura'],
            $subtotal_usd,
            $item['total_bs']
        ]);

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