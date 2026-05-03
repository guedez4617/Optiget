<?php
header('Content-Type: application/json');
include 'db_conexion.php';
require_once 'procesar_vencidos.php';

try {
    // Procesar cualquier lote que se haya vencido hoy o antes
    procesarLotesVencidos($pdo);

    // Consulta para obtener lotes que vencen en los próximos 7 días (Activos)
    // O que ya fueron quitados por vencidos (estado_lote = 'Vencido')
    // Excluyendo productos inactivos (p.estado = 0)
    $sql = "SELECT p.Codigo, p.nombre, l.numero_lote, l.fecha_caducidad, l.cantidad, l.estado_lote,
                   DATEDIFF(l.fecha_caducidad, CURRENT_DATE) as dias_restantes
            FROM lotes_producto l
            JOIN productos p ON l.codigo_producto = p.Codigo
            WHERE p.estado = 1 
              AND l.fecha_caducidad != '9999-12-31'
              AND (
                (l.fecha_caducidad BETWEEN CURRENT_DATE AND DATE_ADD(CURRENT_DATE, INTERVAL 7 DAY) AND l.estado_lote = 'Activo')
                OR l.estado_lote = 'Vencido'
              )
            ORDER BY l.estado_lote ASC, l.fecha_caducidad ASC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $lotes = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Contar solo los que aún están activos para la notificación
    $activos = 0;
    foreach ($lotes as $lote) {
        if ($lote['estado_lote'] === 'Activo') {
            $activos++;
        }
    }

    echo json_encode([
        "status" => "success",
        "cantidad" => $activos,
        "lotes" => $lotes
    ]);

} catch (PDOException $e) {
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}
?>
