<?php
include 'db_conexion.php';
header('Content-Type: application/json');

try {
    $sql = "SELECT DISTINCT YEAR(fecha) as ano, MONTH(fecha) as mes FROM factura WHERE fecha IS NOT NULL ORDER BY ano DESC, mes DESC";
    $stmt = $pdo->query($sql);
    $periodos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(["status" => "success", "data" => $periodos]);
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
