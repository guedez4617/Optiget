<?php
/**
 * Script de Migración de Lotes Iniciales
 * Este script lee el archivo "fechas de vencimiento.txt" y crea un registro en lotes_producto
 * para cada producto que aún no tenga lotes, utilizando su stock actual.
 */

include 'db_conexion.php';

// Configuración
$archivo = '../fechas de vencimiento.txt';
$usuario_ci = 'SISTEMA'; // O un CI de administrador real si se prefiere

if (!file_exists($archivo)) {
    die("Error: El archivo '$archivo' no existe.");
}

$lineas = file($archivo, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
$header = array_shift($lineas); // Quitar encabezado

$total_procesados = 0;
$total_creados = 0;
$total_errores = 0;
$detalles_errores = [];

echo "Iniciando migración...\n";

try {
    foreach ($lineas as $num_linea => $linea) {
        $datos = str_getcsv($linea, ';');
        if (count($datos) < 5) continue;

        $codigo = trim($datos[0]);
        $vencimiento_raw = trim($datos[4]);

        $total_procesados++;

        // 1. Buscar producto en la base de datos
        $stmt = $pdo->prepare("SELECT Codigo, nombre, unidades FROM productos WHERE Codigo = ?");
        $stmt->execute([$codigo]);
        $producto = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$producto) {
            $total_errores++;
            $detalles_errores[] = "Línea " . ($num_linea + 2) . ": Producto con código '$codigo' no encontrado en la BD.";
            continue;
        }

        // 2. Verificar si ya tiene lotes para evitar duplicados
        $stmt_check = $pdo->prepare("SELECT COUNT(*) FROM lotes_producto WHERE codigo_producto = ?");
        $stmt_check->execute([$codigo]);
        if ($stmt_check->fetchColumn() > 0) {
            // Ya tiene lotes, saltamos para no duplicar el stock formal
            continue;
        }

        // 3. Procesar Fecha de Vencimiento
        $fecha_caducidad = '9999-12-31';
        $fecha_lote_str = '000000';

        if (strtoupper($vencimiento_raw) !== 'N/A' && !empty($vencimiento_raw)) {
            // Formato esperado DD/MM/YYYY
            $partes_fecha = explode('/', $vencimiento_raw);
            if (count($partes_fecha) === 3) {
                $fecha_caducidad = "{$partes_fecha[2]}-{$partes_fecha[1]}-{$partes_fecha[0]}";
                
                // Formato YYMMDD para el código de lote
                $yy = substr($partes_fecha[2], -2);
                $mm = str_pad($partes_fecha[1], 2, '0', STR_PAD_LEFT);
                $dd = str_pad($partes_fecha[0], 2, '0', STR_PAD_LEFT);
                $fecha_lote_str = $yy . $mm . $dd;
            }
        }

        // 4. Generar Número de Lote (COD-001-YYMMDD)
        $numero_lote = "$codigo-001-$fecha_lote_str";
        $cantidad = intval($producto['unidades']);

        // 5. Insertar el lote
        $sql_ins = "INSERT INTO lotes_producto (codigo_producto, numero_lote, fecha_caducidad, cantidad) VALUES (?, ?, ?, ?)";
        $stmt_ins = $pdo->prepare($sql_ins);
        $stmt_ins->execute([$codigo, $numero_lote, $fecha_caducidad, $cantidad]);

        $total_creados++;
    }

    echo "\nMigración finalizada con éxito.\n";
    echo "Total líneas procesadas: $total_procesados\n";
    echo "Lotes creados: $total_creados\n";
    echo "Errores/No encontrados: $total_errores\n";

    if (!empty($detalles_errores)) {
        echo "\nDetalles de errores:\n";
        foreach ($detalles_errores as $err) {
            echo "- $err\n";
        }
    }

} catch (Exception $e) {
    echo "\nFATAL ERROR: " . $e->getMessage() . "\n";
}
?>
