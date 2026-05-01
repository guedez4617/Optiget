<?php
header('Content-Type: application/json');
include 'db_conexion.php';
$id = $_GET['id'] ?? null;

if (!$id) {
    echo json_encode(["status" => "error", "mensaje" => "ID no proporcionado"]);
    exit;
}

try {
    
    $sqlC = "SELECT 
                f.id_factura, f.fecha, f.hora, f.ci_cliente, f.tipo_pago,
                c.NOMBRE as nombre_cliente, c.telefono, c.direccion, 
                u.NOMBRE as nombre_vendedor, u.APELLIDO as apellido_vendedor,
                dn.nombre AS emp_nombre, 
                dn.rif AS emp_rif, 
                dn.direccion AS emp_dir, 
                dn.telefono AS emp_tel
            FROM factura f 
            LEFT JOIN clientes c ON f.ci_cliente = c.`c.i` 
            LEFT JOIN usuarios u ON f.usuario_ci = u.`C.I` 
            LEFT JOIN datos_negocio dn ON f.id_config_negocio = dn.id_config
            WHERE f.id_factura = ?";
    
    $stC = $pdo->prepare($sqlC);
    $stC->execute([$id]);
    $cab = $stC->fetch(PDO::FETCH_ASSOC);

    if (!$cab) {
        echo json_encode(["status" => "error", "mensaje" => "Factura no encontrada"]);
        exit;
    }

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

    $sqlA = "SELECT metodo_pago, monto_abonado FROM abonos WHERE id_factura = ?";
    $stA = $pdo->prepare($sqlA);
    $stA->execute([$id]);
    $abonos = $stA->fetchAll(PDO::FETCH_ASSOC);

    if (count($abonos) > 0) {
        $metodos_con_monto = [];
        $metodos_solos = [];
        foreach ($abonos as $a) {
            $metodos_con_monto[] = $a['metodo_pago'] . " ($" . number_format($a['monto_abonado'], 2) . ")";
            $metodos_solos[] = $a['metodo_pago'];
        }
        
        $metodos_solos = array_unique($metodos_solos); 

        if ($cab['tipo_pago'] === 'Crédito') {
            $cab['tipo_pago'] = "Crédito (Abonos: " . implode(", ", $metodos_con_monto) . ")";
        } else {
            $cab['tipo_pago'] = implode(" | ", $metodos_solos);
        }
    }

    echo json_encode([
        "status" => "ok", 
        "cabecera" => $cab, 
        "productos" => $prods
    ]);

} catch (Exception $e) {
    echo json_encode(["status" => "error", "mensaje" => "Error SQL: " . $e->getMessage()]);
}