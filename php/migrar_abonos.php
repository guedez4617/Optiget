<?php
// php/migrar_abonos.php
header('Content-Type: text/plain');
include 'db_conexion.php';

try {
    $pdo->beginTransaction();

    // Buscar facturas que NO sean Crédito y que no tengan ya registros en la tabla abonos
    $sqlFacturas = "
        SELECT f.id_factura, f.tipo_pago, f.fecha, f.usuario_ci,
               (SELECT SUM(df.sub_total) FROM det_factura df WHERE df.id_factura = f.id_factura) as total_factura
        FROM factura f
        WHERE f.tipo_pago NOT LIKE '%Credito%' AND f.tipo_pago NOT LIKE '%Crédito%' 
          AND f.tipo_pago != 'Pagado'
          AND NOT EXISTS (SELECT 1 FROM abonos a WHERE a.id_factura = f.id_factura)
    ";
    
    $stmt = $pdo->query($sqlFacturas);
    $facturas = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $count = 0;
    foreach ($facturas as $f) {
        $id_factura = $f['id_factura'];
        $monto = floatval($f['total_factura']);
        // El tipo de pago viejo era directamente el método (Punto, Efectivo, etc.)
        $metodo = $f['tipo_pago']; 
        $usuario = $f['usuario_ci'];

        if ($monto > 0) {
            $sqlIns = "INSERT INTO abonos (id_factura, monto_abonado, fecha_pago, metodo_pago, usuario_ci) 
                       VALUES (?, ?, ?, ?, ?)";
            $stmtIns = $pdo->prepare($sqlIns);
            $stmtIns->execute([$id_factura, $monto, $f['fecha'] . ' 12:00:00', $metodo, $usuario]);
            
            // Actualizar la factura a 'Pagado' ya que ahora está registrada en abonos
            $upd = $pdo->prepare("UPDATE factura SET tipo_pago = 'Pagado' WHERE id_factura = ?");
            $upd->execute([$id_factura]);

            $count++;
        }
    }

    $pdo->commit();
    echo "Migración completada. $count facturas antiguas migradas a la tabla de abonos.";

} catch (Exception $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    echo "Error: " . $e->getMessage();
}
?>
