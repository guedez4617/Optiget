<?php

header('Content-Type: application/json');
if (ob_get_length()) ob_clean(); 
require_once 'db_conexion.php'; 

try {
    if (!isset($pdo)) {
        throw new Exception("Error de configuración: La variable de conexión \$pdo no existe.");
    }


    $json = file_get_contents("php://input");
    $data = json_decode($json, true);

    if (!$data) {
        throw new Exception("No se recibieron datos válidos.");
    }

    $cedula_cliente = $data['cedula_cliente'] ?? '';
    $cedula_usuario = $data['cedula_usuario'] ?? ''; // La cédula del cajero/gerente
    $monto_total_abono = floatval($data['monto_abonado'] ?? 0);
    $metodo = $data['metodo_pago'] ?? 'Efectivo';

    if (empty($cedula_cliente) || empty($cedula_usuario)) {
        throw new Exception("Cédula de cliente o usuario ausente.");
    }

    if ($monto_total_abono <= 0) {
        throw new Exception("El monto debe ser mayor a cero.");
    }


    $pdo->beginTransaction();


    $sql_f = "SELECT f.id_factura, 
                    (SELECT SUM(sub_total) FROM det_factura WHERE id_factura = f.id_factura) as monto_total_factura
                FROM factura f
                WHERE f.ci_cliente = :c 
                AND (f.tipo_pago = 'Credito' OR f.tipo_pago = 'Crédito') 
                ORDER BY f.fecha ASC, f.hora ASC";
            
    $stmt = $pdo->prepare($sql_f);
    $stmt->execute([':c' => $cedula_cliente]);
    $facturas = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $restante = $monto_total_abono;

    foreach ($facturas as $f) {
        if ($restante <= 0) break;

        $id_f = $f['id_factura'];
        $monto_factura = floatval($f['monto_total_factura']);
        

        $st_ab = $pdo->prepare("SELECT SUM(monto_abonado) as total FROM abonos WHERE id_factura = :id");
        $st_ab->execute([':id' => $id_f]);
        $res_abono = $st_ab->fetch(PDO::FETCH_ASSOC);
        $abonado_previo = floatval($res_abono['total'] ?? 0);
        
        $deuda_actual_factura = $monto_factura - $abonado_previo;


        if ($deuda_actual_factura > 0) {
            $pago_ahora = min($restante, $deuda_actual_factura);

            $sql_ins = "INSERT INTO abonos (id_factura, monto_abonado, fecha_pago, metodo_pago, usuario_ci) 
                        VALUES (?, ?, NOW(), ?, ?)";
            $ins = $pdo->prepare($sql_ins);
            $ins->execute([$id_f, $pago_ahora, $metodo, $cedula_usuario]);

            if (($deuda_actual_factura - $pago_ahora) <= 0.01) {
                $upd = $pdo->prepare("UPDATE factura SET tipo_pago = 'Pagado' WHERE id_factura = ?");
                $upd->execute([$id_f]);
            }

            $restante -= $pago_ahora;
        }
    }

    $pdo->commit();

    // Si había IGTF, registrarlo como abono adicional en la primera factura del cliente
    $igtf = floatval($data['igtf'] ?? 0);
    if ($igtf > 0 && count($facturas) > 0) {
        $primera_factura = $facturas[0]['id_factura'];
        $sql_igtf = "INSERT INTO abonos (id_factura, monto_abonado, fecha_pago, metodo_pago, usuario_ci) 
                     VALUES (?, ?, NOW(), 'IGTF (3%)', ?)";
        $ins_igtf = $pdo->prepare($sql_igtf);
        $ins_igtf->execute([$primera_factura, $igtf, $cedula_usuario]);
    }

    echo json_encode(["status" => "success", "message" => "Abono procesado correctamente."]);

} catch (Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>