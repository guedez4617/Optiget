<?php
// Activamos la visualización de errores temporalmente por si algo falla en la DB
error_reporting(E_ALL);
ini_set('display_errors', 1);

include 'db_conexion.php';
header('Content-Type: application/json');

try {
    // 1. Buscamos TODAS las facturas que sean a crédito y las cruzamos con la tabla clientes
    // Usamos LEFT JOIN: si la cédula no está en la tabla 'clientes', la factura igual se procesa.
    $sql_facturas = "SELECT 
                        f.id_factura, 
                        f.ci_cliente as cedula, 
                        c.NOMBRE, 
                        c.telefono, 
                        c.direccion 
                     FROM factura f
                     LEFT JOIN clientes c ON f.ci_cliente = c.`c.i`
                     WHERE f.tipo_pago = 'Credito' OR f.tipo_pago = 'Crédito'";
                     
    $stmt_facturas = $pdo->query($sql_facturas);
    $facturas = $stmt_facturas->fetchAll(PDO::FETCH_ASSOC);

    $clientes_agrupados = [];

    // 2. Recorremos factura por factura
    foreach ($facturas as $fac) {
        $id_fac = $fac['id_factura'];
        $cedula = $fac['cedula'];

        // Si es la primera vez que vemos a este cliente, lo preparamos en nuestro arreglo
        if (!isset($clientes_agrupados[$cedula])) {
            $clientes_agrupados[$cedula] = [
                "cedula" => $cedula,
                "NOMBRE" => $fac['NOMBRE'] ? $fac['NOMBRE'] : "CLIENTE DESCONOCIDO",
                "telefono" => $fac['telefono'] ? $fac['telefono'] : "0000",
                "direccion" => $fac['direccion'] ? $fac['direccion'] : "S/D",
                "total_deuda" => 0,
                "total_abonado" => 0
            ];
        }

        // --- A. Calculamos cuánto costó ESTA factura (Sumamos det_factura) ---
        $sql_deuda = "SELECT SUM(sub_total) as total FROM det_factura WHERE id_factura = ?";
        $stmt_deuda = $pdo->prepare($sql_deuda);
        $stmt_deuda->execute([$id_fac]);
        $costo_factura = $stmt_deuda->fetchColumn() ?: 0;

        $clientes_agrupados[$cedula]["total_deuda"] += floatval($costo_factura);

        // --- B. Calculamos cuánto le han abonado a ESTA factura (Sumamos abonos) ---
        $sql_abono = "SELECT SUM(monto_abonado) as abonado FROM abonos WHERE id_factura = ?";
        $stmt_abono = $pdo->prepare($sql_abono);
        $stmt_abono->execute([$id_fac]);
        $abono_factura = $stmt_abono->fetchColumn() ?: 0;

        $clientes_agrupados[$cedula]["total_abonado"] += floatval($abono_factura);
    }

    // 3. Ya tenemos todo sumado. Ahora restamos para sacar el saldo pendiente real.
    $respuesta_final = [];

    foreach ($clientes_agrupados as $cliente) {
        $saldo_pendiente = $cliente["total_deuda"] - $cliente["total_abonado"];

        // Si todavía debe más de 0 centavos, lo enviamos al JavaScript
        if ($saldo_pendiente > 0.01) {
            $respuesta_final[] = [
                "cedula" => $cliente["cedula"],
                "NOMBRE" => $cliente["NOMBRE"],
                "telefono" => $cliente["telefono"],
                "direccion" => $cliente["direccion"],
                "saldo_pendiente" => round($saldo_pendiente, 2)
            ];
        }
    }

    // Enviamos el resultado
    echo json_encode(array_values($respuesta_final));

} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>