<?php
error_reporting(E_ALL); 
ini_set('display_errors', 0); 
header('Content-Type: application/json');
include 'db_conexion.php';

try {
    $sql = "SELECT f.Id_factura, f.tipo_pago, f.fecha, f.hora, f.ci_cliente,
            c.NOMBRE as nombre_cliente,
            (SELECT SUM(sub_total) FROM det_factura WHERE id_factura = f.Id_factura) as total_venta 
            FROM factura f 
            LEFT JOIN clientes c ON f.ci_cliente = c.`c.i` 
            ORDER BY f.Id_factura DESC";
            
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $ventas = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode($ventas ? $ventas : []);

} catch (PDOException $e) {
    echo json_encode(["error" => "Error en la base de datos: " . $e->getMessage()]);
}
?>