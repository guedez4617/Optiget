<?php
header('Content-Type: application/json');
ob_start();

include 'db_conexion.php'; 

try {
    if (!isset($pdo)) {
        throw new Exception("No se encontró la variable de conexión \$pdo");
    }

    $json = file_get_contents("php://input");
    $data = json_decode($json, true);

    if (!$data) throw new Exception("No se recibieron datos.");

    $cedula = $data['cedula_cliente'];
    $monto_total_abono = floatval($data['monto_abonado']);
    $metodo = $data['metodo_pago'];

    $pdo->beginTransaction();

    // 1. OBTENER FACTURAS PENDIENTES 
    // Corregido: Ahora busca 'Credito' OR 'Crédito'
    $sql_f = "SELECT f.id_factura, SUM(df.sub_total) as monto_factura 
            FROM factura f
            JOIN det_factura df ON f.id_factura = df.id_factura
            WHERE f.ci_cliente = :c 
            AND (f.tipo_pago = 'Credito' OR f.tipo_pago = 'Crédito') 
            GROUP BY f.id_factura 
            ORDER BY f.fecha ASC";
            
    $stmt = $pdo->prepare($sql_f);
    $stmt->execute([':c' => $cedula]);
    $facturas = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $restante = $monto_total_abono;

    foreach ($facturas as $f) {
        if ($restante <= 0) break;

        $id_f = $f['id_factura'];
        
        // Sumar abonos previos
        $st_ab = $pdo->prepare("SELECT SUM(monto_abonado) as total FROM abonos WHERE id_factura = :id");
        $st_ab->execute([':id' => $id_f]);
        $abonado_previo = floatval($st_ab->fetch(PDO::FETCH_ASSOC)['total'] ?? 0);
        
        $deuda_factura = floatval($f['monto_factura']) - $abonado_previo;

        if ($deuda_factura > 0) {
            $pago_ahora = min($restante, $deuda_factura);

            // 2. INSERT del abono
            $sql_ins = "INSERT INTO abonos (id_factura, monto_abonado, fecha_pago, metodo_pago, usuario_ci) 
                        VALUES (?, ?, NOW(), ?, ?)";
            
            $ins = $pdo->prepare($sql_ins);
            $ins->execute([$id_f, $pago_ahora, $metodo, $cedula]);

            // 3. CAMBIO DE ESTADO (Solo si la deuda llega a cero)
            // Usamos un margen de 0.01 por los decimales
            if (($deuda_factura - $pago_ahora) <= 0.01) {
                $upd = $pdo->prepare("UPDATE factura SET tipo_pago = 'Pagado' WHERE id_factura = ?");
                $upd->execute([$id_f]);
            }
            $restante -= $pago_ahora;
        }
    }

    $pdo->commit();
    ob_end_clean();
    echo json_encode(["status" => "success"]);

} catch (Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) $pdo->rollBack();
    ob_end_clean();
    echo json_encode(["status" => "error", "message" => "Error: " . $e->getMessage()]);
}
?>