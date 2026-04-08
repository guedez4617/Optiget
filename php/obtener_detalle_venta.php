<?php
header('Content-Type: application/json');
include 'db_conexion.php';
$id = $_GET['id'] ?? null;

try {
    // Consulta Cabecera
    $sqlC = "SELECT f.id_factura, f.fecha, f.hora, f.ci_cliente, f.tipo_pago, f.nombre_empleado as empleado,
                    c.NOMBRE as nombre_cliente, c.telefono, c.direccion as residencia 
            FROM factura f LEFT JOIN clientes c ON f.ci_cliente = c.`c.i` WHERE f.id_factura = ?";
    $stC = $pdo->prepare($sqlC);
    $stC->execute([$id]);
    $cab = $stC->fetch(PDO::FETCH_ASSOC);

    // Consulta Productos - SE AGREGÓ df.total_bs AQUÍ ABAJO
    $sqlP = "SELECT df.codigo_producto, df.cantidad as cantidadFactura, df.sub_total as subtotal_base, 
                    df.total_bs, 
                    p.nombre as nombre_prod, p.presentacion as presentacion_prod, p.`i.v.a.` as tiene_iva
            FROM det_factura df LEFT JOIN productos p ON df.codigo_producto = p.Codigo WHERE df.id_factura = ?";
    $stP = $pdo->prepare($sqlP);
    $stP->execute([$id]);
    $prods = $stP->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(["status" => "ok", "cabecera" => $cab, "productos" => $prods]);
} catch (Exception $e) {
    echo json_encode(["status" => "error", "mensaje" => $e->getMessage()]);
}