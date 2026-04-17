<?php
include 'db_conexion.php';
header('Content-Type: application/json');

$filtro = $_GET['periodo'] ?? '1dia';

switch ($filtro) {
    case '1semana':
        $whereFecha = "f.fecha BETWEEN DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY) AND DATE_ADD(CURDATE(), INTERVAL 6 - WEEKDAY(CURDATE()) DAY)";
        break;
    case '1mes':
        $whereFecha = "YEAR(f.fecha) = YEAR(CURDATE()) AND MONTH(f.fecha) = MONTH(CURDATE())";
        break;
    default:
        $whereFecha = "f.fecha = CURDATE()";
        break;
}

try {
    $sqlPeriodo = "SELECT 
        SUM(CASE WHEN tipo_pago != 'Crédito' THEN df.sub_total ELSE 0 END) as ventas,
        SUM(CASE WHEN tipo_pago = 'Crédito' THEN df.sub_total ELSE 0 END) as creditos_periodo
        FROM factura f JOIN det_factura df ON f.id_factura = df.id_factura 
        WHERE $whereFecha";
    $resPeriodo = $pdo->query($sqlPeriodo)->fetch(PDO::FETCH_ASSOC);

    $sqlGlobal = "SELECT SUM(df.sub_total) as total_deuda 
                    FROM factura f JOIN det_factura df ON f.id_factura = df.id_factura 
                    WHERE f.tipo_pago = 'Crédito'";
    $resGlobal = $pdo->query($sqlGlobal)->fetch(PDO::FETCH_ASSOC);

    $sqlMetodos = "SELECT tipo_pago, SUM(df.sub_total) as monto 
                    FROM factura f JOIN det_factura df ON f.id_factura = df.id_factura
                    WHERE $whereFecha AND tipo_pago != 'Crédito'
                    GROUP BY tipo_pago";
    $metodos = $pdo->query($sqlMetodos)->fetchAll(PDO::FETCH_ASSOC);
    
    $labelsMetodos = []; $valoresMetodos = [];
    foreach ($metodos as $m) {
        $labelsMetodos[] = $m['tipo_pago'] . " ($" . number_format($m['monto'], 2) . ")";
        $valoresMetodos[] = $m['monto'];
    }

    $sqlTop = "SELECT p.nombre, SUM(df.cantidad) as total 
                FROM det_factura df JOIN factura f ON df.id_factura = f.id_factura
                JOIN productos p ON df.codigo_producto = p.Codigo
                WHERE $whereFecha
                GROUP BY p.nombre ORDER BY total DESC LIMIT 5";
    $top = $pdo->query($sqlTop)->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "totalVentas" => number_format($resPeriodo['ventas'] ?? 0, 2),
        "totalCreditoPeriodo" => number_format($resPeriodo['creditos_periodo'] ?? 0, 2),
        "totalGlobalCredito" => number_format($resGlobal['total_deuda'] ?? 0, 2), // <--- Este es el dato fijo
        "labelsMetodos" => $labelsMetodos,
        "valoresMetodos" => $valoresMetodos,
        "productosNombres" => array_column($top, 'nombre'),
        "productosCantidades" => array_column($top, 'total')
    ]);

} catch (PDOException $e) { echo json_encode(["error" => $e->getMessage()]); }