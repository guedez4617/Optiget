<?php
// Este script se encarga de procesar los lotes que ya llegaron a su fecha de caducidad.
// Descuenta la cantidad del almacén principal (productos) y marca el lote como Vencido.
function procesarLotesVencidos($pdo) {
    try {
        // Encontrar todos los lotes activos que ya vencieron
        $sqlSelect = "SELECT id_lote, codigo_producto, cantidad 
                      FROM lotes_producto 
                      WHERE fecha_caducidad <= CURRENT_DATE 
                        AND estado_lote = 'Activo' 
                        AND fecha_caducidad != '9999-12-31'";
        
        $stmtSelect = $pdo->query($sqlSelect);
        $lotesVencidos = $stmtSelect->fetchAll(PDO::FETCH_ASSOC);

        if (count($lotesVencidos) > 0) {
            $pdo->beginTransaction();

            $sqlUpdateProducto = "UPDATE productos SET unidades = unidades - ? WHERE Codigo = ?";
            $stmtUpdateProd = $pdo->prepare($sqlUpdateProducto);

            $sqlUpdateLote = "UPDATE lotes_producto SET cantidad = 0, estado_lote = 'Vencido' WHERE id_lote = ?";
            $stmtUpdateLote = $pdo->prepare($sqlUpdateLote);

            $sqlLog = "INSERT INTO historial_productos (codigo_producto, accion, usuario_ci, detalles, fecha) 
                       VALUES (?, 'VENCIMIENTO LOTE', 'SISTEMA', ?, NOW())";
            $stmtLog = $pdo->prepare($sqlLog);

            foreach ($lotesVencidos as $lote) {
                // Descontar la cantidad total del producto
                $stmtUpdateProd->execute([$lote['cantidad'], $lote['codigo_producto']]);
                
                // Marcar el lote como vencido y cantidad 0
                $stmtUpdateLote->execute([$lote['id_lote']]);

                // Registrar en historial
                $detalles = "El sistema retiró automáticamente {$lote['cantidad']} unidades (Lote ID: {$lote['id_lote']}) por caducidad.";
                $stmtLog->execute([$lote['codigo_producto'], $detalles]);
            }

            $pdo->commit();
        }
    } catch (Exception $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        // Log o manejar error si es necesario
        error_log("Error al procesar lotes vencidos: " . $e->getMessage());
    }
}
?>
