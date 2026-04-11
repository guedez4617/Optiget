<?php
include 'db_conexion.php'; // Asegúrate de que este archivo tenga tu conexión PDO
header('Content-Type: application/json');

try {
    // Consulta avanzada: Suma sub_totales y resta abonos registrados
    $sql = "SELECT 
                c.`c.i` as cedula, 
                c.NOMBRE, 
                c.telefono,
                c.direccion,
                COUNT(DISTINCT f.id_factura) as cant_facturas,
                (SUM(df.sub_total) - COALESCE((SELECT SUM(a.monto_abonado) FROM abonos a JOIN factura f2 ON a.id_factura = f2.id_factura WHERE f2.ci_cliente = c.`c.i`), 0)) as saldo_pendiente
            FROM factura f
            JOIN clientes c ON f.ci_cliente = c.`c.i`
            JOIN det_factura df ON f.id_factura = df.id_factura
            WHERE f.tipo_pago = 'Credito'
            GROUP BY c.`c.i`
            HAVING saldo_pendiente > 0
            ORDER BY saldo_pendiente DESC";
            
    $stmt = $pdo->query($sql);
    $deudores = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode($deudores);
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>