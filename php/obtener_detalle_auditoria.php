<?php
include 'db_conexion.php';
header('Content-Type: application/json');

$ci = $_GET['ci'] ?? '';

if (empty($ci)) {
    echo json_encode(["error" => "C.I. no proporcionada"]);
    exit;
}

try {
    $sqlSesiones = "SELECT id_sesion, fecha_inicio, fecha_fin 
                    FROM auditoria_sesiones 
                    WHERE usuario_ci = :ci 
                    ORDER BY fecha_inicio DESC";
    $stmtS = $pdo->prepare($sqlSesiones);
    $stmtS->execute(['ci' => $ci]);
    $sesiones = $stmtS->fetchAll(PDO::FETCH_ASSOC);

    $resultadoFinal = [];

    foreach ($sesiones as $sesion) {
        $inicio = $sesion['fecha_inicio'];
        $fin = $sesion['fecha_fin'] ?? date('Y-m-d H:i:s');

        $sqlAcciones = "
            -- 1. Ventas realizadas
            SELECT 'VENTA' as accion, 
                    CONCAT('Factura #', f.id_factura, ' - Tipo: ', f.tipo_pago, ' - Total: $', IFNULL((SELECT SUM(df.sub_total) FROM det_factura df WHERE df.id_factura = f.id_factura), 0)) as detalles, 
                    CONCAT(f.fecha, ' ', f.hora) as fecha_completa
            FROM factura f
            WHERE f.usuario_ci = :ci AND CONCAT(f.fecha, ' ', f.hora) BETWEEN :inicio AND :fin

            UNION ALL

            -- 2. Abonos registrados
            SELECT 'ABONO' as accion, 
                    CONCAT('Abono a Factura #', id_factura, ' por $', monto_abonado, ' (', metodo_pago, ')') as detalles, 
                    fecha_pago as fecha_completa
            FROM abonos 
            WHERE usuario_ci = :ci AND fecha_pago BETWEEN :inicio AND :fin

            UNION ALL

            -- 3. Historial (Crear, Editar, Habilitar, Inhabilitar productos)
            SELECT hp.accion, 
                   CONCAT('[', IFNULL(p.nombre, 'Producto Desconocido'), '] ', hp.detalles) as detalles, 
                   hp.fecha as fecha_completa
            FROM historial_productos hp
            LEFT JOIN productos p ON p.Codigo = hp.codigo_producto
            WHERE hp.usuario_ci = :ci AND hp.fecha BETWEEN :inicio AND :fin

            UNION ALL

            -- 4. Cambios en datos del negocio
            SELECT 'NEGOCIO' as accion, 
                    IFNULL(detalles_auditoria, 'Actualizó información general del establecimiento') as detalles, 
                    fecha_movimiento as fecha_completa
            FROM datos_negocio 
            WHERE id_usuario_cambio = :ci AND fecha_movimiento BETWEEN :inicio AND :fin

            ORDER BY fecha_completa ASC";

        $stmtA = $pdo->prepare($sqlAcciones);
        $stmtA->execute([
            'ci' => $ci,
            'inicio' => $inicio,
            'fin' => $fin
        ]);
        
        $movimientos = $stmtA->fetchAll(PDO::FETCH_ASSOC);

        $resultadoFinal[] = [
            "inicio" => $inicio,
            "fin" => $sesion['fecha_fin'] ?? "Sesión Activa",
            "movimientos" => $movimientos
        ];
    }

    echo json_encode($resultadoFinal);

} catch (PDOException $e) {
    echo json_encode(["error" => $e->getMessage()]);
}