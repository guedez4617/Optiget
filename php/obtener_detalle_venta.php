<?php
// 1. Evitar cualquier salida de texto accidental que rompa el JSON
ob_start();
header('Content-Type: application/json; charset=utf-8');

// 2. Conexión a la base de datos
include 'db_conexion.php';

// 3. Desactivar errores visibles para el usuario (se manejan en el catch)
error_reporting(0);
ini_set('display_errors', 0);

// 4. Capturar el ID de la factura desde la URL
$id = isset($_GET['id']) ? intval($_GET['id']) : 0;

try {
    if ($id <= 0) {
        throw new Exception("ID de factura no proporcionado o no es válido.");
    }

    // 5. Consultar los datos de la cabecera de la factura
    // SE AGREGA: nombre_empleado a la consulta
    $queryFactura = "SELECT id_factura, fecha, hora, ci_cliente, tipo_pago, nombre_empleado 
                    FROM factura 
                    WHERE id_factura = ?";
    $stmt = $pdo->prepare($queryFactura);
    $stmt->execute([$id]);
    $f = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$f) {
        throw new Exception("La factura con ID #$id no existe en el sistema.");
    }

    // 6. Consultar los datos del cliente
    $queryCliente = "SELECT NOMBRE, TELEFONO, DIRECCION FROM clientes WHERE `c.i` = ?";
    $stmtC = $pdo->prepare($queryCliente);
    $stmtC->execute([$f['ci_cliente']]);
    $cli = $stmtC->fetch(PDO::FETCH_ASSOC);

    // Valores por defecto si no hay cliente
    $nombre_cliente = ($cli && !empty($cli['NOMBRE'])) ? $cli['NOMBRE'] : "CLIENTE GENERAL";
    $telefono_cliente = ($cli && !empty($cli['TELEFONO'])) ? $cli['TELEFONO'] : "S/N";
    $direccion_cliente = ($cli && !empty($cli['DIRECCION'])) ? $cli['DIRECCION'] : "SIN DIRECCIÓN REGISTRADA";

    // 7. Consultar los productos detallados en det_factura
    $queryDetalle = "SELECT d.cantidad, d.sub_total, d.total_iva, p.nombre, p.Codigo 
                    FROM det_factura d 
                    JOIN productos p ON d.codigo_producto = p.Codigo 
                    WHERE d.id_factura = ?";
    $stmtD = $pdo->prepare($queryDetalle);
    $stmtD->execute([$id]);
    $items = $stmtD->fetchAll(PDO::FETCH_ASSOC);

    $productos = [];
    foreach ($items as $i) {
        $cantidad = ($i['cantidad'] > 0) ? (int)$i['cantidad'] : 1;
        $precioUnitario = (float)$i['sub_total'] / $cantidad;

        $productos[] = [
            "codigo" => $i['Codigo'],
            "nombre" => $i['nombre'],
            "cantidadFactura" => $cantidad,
            "precio" => (float)$precioUnitario,
            "subtotal" => (float)$i['sub_total'],
            "iva" => (float)$i['total_iva']
        ];
    }

    // 8. Construir la respuesta final enviando el nombre del empleado
    $response = [
        "status" => "ok",
        "cabecera" => [
            "id" => $f['id_factura'],
            "fecha" => $f['fecha'],
            "hora" => $f['hora'],
            "empleado" => $f['nombre_empleado'] ?? "No asignado", // <-- NUEVO
            "tipo_pago" => $f['tipo_pago'],
            "ci_cliente" => $f['ci_cliente'],
            "nombre_cliente" => $nombre_cliente,
            "telefono" => $telefono_cliente,
            "residencia" => $direccion_cliente
        ],
        "productos" => $productos
    ];

    // Limpiar buffer y enviar JSON
    ob_end_clean();
    echo json_encode($response);

} catch (Exception $e) {
    if (ob_get_length()) ob_end_clean();
    echo json_encode([
        "status" => "error",
        "mensaje" => $e->getMessage()
    ]);
}
exit;