<?php
// 1. Evitar cualquier salida de texto accidental
ob_start();
header('Content-Type: application/json; charset=utf-8');

// 2. Conexión a la base de datos
include 'db_conexion.php';

// 3. Configuración de errores
error_reporting(0);
ini_set('display_errors', 0);

$id = isset($_GET['id']) ? intval($_GET['id']) : 0;

try {
    if ($id <= 0) {
        throw new Exception("ID de factura no válido.");
    }

    // 4. Consultar cabecera de factura
    $queryFactura = "SELECT id_factura, fecha, hora, ci_cliente, tipo_pago, nombre_empleado 
                    FROM factura 
                    WHERE id_factura = ?";
    $stmt = $pdo->prepare($queryFactura);
    $stmt->execute([$id]);
    $f = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$f) {
        throw new Exception("La factura #$id no existe.");
    }

    // 5. Consultar datos del cliente
    $queryCliente = "SELECT NOMBRE, TELEFONO, DIRECCION FROM clientes WHERE `c.i` = ?";
    $stmtC = $pdo->prepare($queryCliente);
    $stmtC->execute([$f['ci_cliente']]);
    $cli = $stmtC->fetch(PDO::FETCH_ASSOC);

    $nombre_cliente = ($cli && !empty($cli['NOMBRE'])) ? $cli['NOMBRE'] : "CLIENTE GENERAL";
    $telefono_cliente = ($cli && !empty($cli['TELEFONO'])) ? $cli['TELEFONO'] : "S/N";
    $direccion_cliente = ($cli && !empty($cli['DIRECCION'])) ? $cli['DIRECCION'] : "SIN DIRECCIÓN";

    // 6. Consultar productos (Agregamos p.`i.v.a.` a la consulta)
    $queryDetalle = "SELECT d.cantidad, d.sub_total, d.total_iva, p.nombre, p.Codigo, p.`i.v.a.` as iva_config 
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

        // LÓGICA PARA EL JS: 
        // Si el total_iva guardado en la factura es > 0, o si el producto está marcado con IVA
        $tieneIva = ($i['total_iva'] > 0 || $i['iva_config'] == 1 || $i['iva_config'] == 'Si') ? 1 : 0;

        $productos[] = [
            "codigo" => $i['Codigo'],
            "nombre" => $i['nombre'],
            "cantidadFactura" => $cantidad,
            "precio" => (float)$precioUnitario,
            "subtotal" => (float)$i['sub_total'],
            "iva" => $tieneIva // Enviamos 1 o 0 para que el JS ponga "Sí" o "No"
        ];
    }

    $response = [
        "status" => "ok",
        "cabecera" => [
            "id" => $f['id_factura'],
            "fecha" => $f['fecha'],
            "hora" => $f['hora'],
            "empleado" => $f['nombre_empleado'] ?? "No asignado",
            "tipo_pago" => $f['tipo_pago'],
            "ci_cliente" => $f['ci_cliente'],
            "nombre_cliente" => $nombre_cliente,
            "telefono" => $telefono_cliente,
            "residencia" => $direccion_cliente
        ],
        "productos" => $productos
    ];

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