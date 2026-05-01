<?php
include 'db_conexion.php';
header('Content-Type: application/json');

$filtro = $_GET['periodo'] ?? '1dia';
$mes = intval($_GET['mes'] ?? 0);
$ano = intval($_GET['ano'] ?? 0);

switch ($filtro) {
    case '1semana':
        $whereFecha = "f.fecha BETWEEN DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY) AND DATE_ADD(CURDATE(), INTERVAL 6 - WEEKDAY(CURDATE()) DAY)";
        break;
    case '1mes':
        $whereFecha = "YEAR(f.fecha) = YEAR(CURDATE()) AND MONTH(f.fecha) = MONTH(CURDATE())";
        break;
    case '1ano':
        $whereFecha = "YEAR(f.fecha) = YEAR(CURDATE())";
        break;
    case 'mes_especifico':
        $whereFecha = "YEAR(f.fecha) = $ano AND MONTH(f.fecha) = $mes";
        break;
    case 'ano_especifico':
        $whereFecha = "YEAR(f.fecha) = $ano";
        break;
    default:
        $whereFecha = "f.fecha = CURDATE()";
        break;
}

try {
    $sqlPeriodo = "
        SELECT 
            (SELECT SUM(a.monto_abonado) FROM abonos a JOIN factura f ON a.id_factura = f.id_factura WHERE $whereFecha) as ventas,
            (
                SELECT SUM(deuda) FROM (
                    SELECT 
                        (SUM(df.sub_total) - COALESCE((SELECT SUM(monto_abonado) FROM abonos a WHERE a.id_factura = f.id_factura), 0)) as deuda
                    FROM factura f JOIN det_factura df ON f.id_factura = df.id_factura
                    WHERE $whereFecha AND f.tipo_pago = 'Crédito'
                    GROUP BY f.id_factura
                ) as deudas
            ) as creditos_periodo
    ";
    $resPeriodo = $pdo->query($sqlPeriodo)->fetch(PDO::FETCH_ASSOC);

    $sqlGlobal = "
        SELECT SUM(deuda) as total_deuda FROM (
            SELECT 
                (SUM(df.sub_total) - COALESCE((SELECT SUM(monto_abonado) FROM abonos a WHERE a.id_factura = f.id_factura), 0)) as deuda
            FROM factura f JOIN det_factura df ON f.id_factura = df.id_factura
            WHERE f.tipo_pago = 'Crédito'
            GROUP BY f.id_factura
        ) as globales
    ";
    $resGlobal = $pdo->query($sqlGlobal)->fetch(PDO::FETCH_ASSOC);

    $sqlMetodos = "SELECT a.metodo_pago as tipo_pago, SUM(a.monto_abonado) as monto 
                   FROM abonos a JOIN factura f ON a.id_factura = f.id_factura
                   WHERE $whereFecha
                   GROUP BY a.metodo_pago";
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

    $sqlIGTF = "SELECT SUM(a.monto_abonado) as total_igtf 
                FROM abonos a JOIN factura f ON a.id_factura = f.id_factura
                WHERE $whereFecha AND a.metodo_pago = 'IGTF (3%)'";
    $resIGTF = $pdo->query($sqlIGTF)->fetch(PDO::FETCH_ASSOC);

    echo json_encode([
        "totalVentas"         => number_format($resPeriodo['ventas'] ?? 0, 2),
        "totalCreditoPeriodo" => number_format($resPeriodo['creditos_periodo'] ?? 0, 2),
        "totalGlobalCredito"  => number_format($resGlobal['total_deuda'] ?? 0, 2),
        "totalIGTF"           => number_format($resIGTF['total_igtf'] ?? 0, 2),
        "labelsMetodos"       => $labelsMetodos,
        "valoresMetodos"      => $valoresMetodos,
        "productosNombres"    => array_column($top, 'nombre'),
        "productosCantidades" => array_column($top, 'total')
    ]);

} catch (PDOException $e) { echo json_encode(["error" => $e->getMessage()]); }