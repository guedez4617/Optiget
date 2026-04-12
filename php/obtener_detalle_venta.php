<?php
header('Content-Type: application/json');
include 'db_conexion.php';
$id = $_GET['id'] ?? null;

if (!$id) {
    echo json_encode(["status" => "error", "mensaje" => "ID no proporcionado"]);
    exit;
}

try {
    // 1. Consulta Cabecera
    // Nota: Asegúrate que en 'clientes' la columna sea 'direccion' o 'residencia'
    $sqlC = "SELECT f.id_factura, f.fecha, f.hora, f.ci_cliente, f.tipo_pago,
                    c.NOMBRE as nombre_cliente, c.telefono, c.direccion, 
                    u.NOMBRE as nombre_vendedor, u.APELLIDO as apellido_vendedor
            FROM factura f 
            LEFT JOIN clientes c ON f.ci_cliente = c.`c.i` 
            LEFT JOIN usuarios u ON f.usuario_ci = u.`C.I` 
            WHERE f.id_factura = ?";
    
    $stC = $pdo->prepare($sqlC);
    $stC->execute([$id]);
    $cab = $stC->fetch(PDO::FETCH_ASSOC);

    if (!$cab) {
        echo json_encode(["status" => "error", "mensaje" => "Factura no encontrada"]);
        exit;
    }

    // 2. Consulta Productos
    // IMPORTANTE: He cambiado p.iva por p.`i.v.a.` que es muy común en tu estructura
    // Si tu columna se llama 'iva' sin puntos, quita los puntos de abajo.
    $sqlP = "SELECT df.codigo_producto, 
                    df.cantidad as cantidadFactura, 
                    df.sub_total as subtotal_base, 
                    df.total_bs, 
                    p.nombre as nombre_prod, 
                    p.presentacion as presentacion_prod, 
                    p.`i.v.a.` as tiene_iva
            FROM det_factura df 
            LEFT JOIN productos p ON df.codigo_producto = p.codigo 
            WHERE df.id_factura = ?";
            
    $stP = $pdo->prepare($sqlP);
    $stP->execute([$id]);
    $prods = $stP->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "status" => "ok", 
        "cabecera" => $cab, 
        "productos" => $prods
    ]);

} catch (Exception $e) {
    echo json_encode(["status" => "error", "mensaje" => "Error SQL: " . $e->getMessage()]);
}