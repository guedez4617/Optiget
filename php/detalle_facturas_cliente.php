<?php
include 'db_conexion.php';
header('Content-Type: application/json');

$cedula = $_GET['cedula'] ?? '';

try {
    $sql = "SELECT 
                f.id_factura, 
                f.fecha, 
                SUM(df.sub_total) as monto_factura,
                (SELECT SUM(a.monto_abonado) FROM abonos a WHERE a.id_factura = f.id_factura) as total_abonado
            FROM factura f
            JOIN det_factura df ON f.id_factura = df.id_factura
            WHERE f.ci_cliente = :cedula AND f.tipo_pago = 'Credito'
            GROUP BY f.id_factura";
            
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':cedula' => $cedula]);
    $facturas = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode($facturas);
} catch (PDOException $e) {
    echo json_encode([]);
}
?>