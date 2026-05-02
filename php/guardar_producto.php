<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
include 'db_conexion.php';

$vendedor_ci = $_SESSION['ci_usuario'] ?? null;

if (!$vendedor_ci) {
    echo json_encode(["status" => "error", "message" => "Acceso denegado. Sesión no encontrada."]);
    exit;
}

$input = file_get_contents("php://input");
$data = json_decode($input, true);

if (!$data || !isset($data['codigo'])) {
    echo json_encode(["status" => "error", "message" => "Datos incompletos"]);
    exit;
}

$codigo       = trim($data['codigo']);
$categoria    = $data['categoria'] ?? '';
$marca        = $data['marca'] ?? '';
$nombre       = $data['nombre'] ?? '';
$presentacion = $data['presentacion'] ?? '';
$cantidad     = intval($data['cantidad'] ?? 0);
$precio       = floatval($data['precio'] ?? 0);
$conIva       = intval($data['conIva'] ?? 0);
$esEdicion    = isset($data['esEdicion']) && $data['esEdicion'] === true;

// Nuevos campos para lotes
$fecha_caducidad = $data['fecha_caducidad'] ?? '';

try {
    $pdo->beginTransaction();

    $nuevoEstado = ($cantidad > 0) ? 1 : 0;
    $accionHistorial = $esEdicion ? "EDICION" : "REGISTRO";

    if ($esEdicion) {
        $sqlAnt = "SELECT * FROM productos WHERE Codigo = ?";
        $stmtAnt = $pdo->prepare($sqlAnt);
        $stmtAnt->execute([$codigo]);
        $productoAnterior = $stmtAnt->fetch(PDO::FETCH_ASSOC);

        $sql = "UPDATE productos SET 
                categoria = ?, marca = ?, nombre = ?, presentacion = ?, 
                precio = ?, `i.v.a.` = ?, estado = ? 
                WHERE Codigo = ?";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $categoria, $marca, $nombre, $presentacion,
            $precio, $conIva, $nuevoEstado, $codigo
        ]);
        $mensaje = "Producto actualizado correctamente.";
        
        $cambios = [];
        if ($productoAnterior) {
            if ($productoAnterior['categoria'] != $categoria) $cambios[] = "Categoría: '{$productoAnterior['categoria']}' -> '$categoria'";
            if ($productoAnterior['marca'] != $marca) $cambios[] = "Marca: '{$productoAnterior['marca']}' -> '$marca'";
            if ($productoAnterior['nombre'] != $nombre) $cambios[] = "Nombre: '{$productoAnterior['nombre']}' -> '$nombre'";
            if ($productoAnterior['presentacion'] != $presentacion) $cambios[] = "Descripción: '{$productoAnterior['presentacion']}' -> '$presentacion'";
            if ($productoAnterior['precio'] != $precio) $cambios[] = "Precio: \${$productoAnterior['precio']} -> \$$precio";
            if ($productoAnterior['i.v.a.'] != $conIva) $cambios[] = "I.V.A: " . ($productoAnterior['i.v.a.'] ? "Sí" : "No") . " -> " . ($conIva ? "Sí" : "No");
        }

        if (empty($cambios)) {
            $detalles = "Edición sin cambios en: $nombre";
        } else {
            $detalles = "Se editó - " . implode(" | ", $cambios);
        }
        
    } else {
        $sql = "INSERT INTO productos (Codigo, categoria, marca, nombre, presentacion, unidades, precio, `i.v.a.`, estado) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $codigo, $categoria, $marca, $nombre, $presentacion,
            $cantidad, $precio, $conIva, $nuevoEstado
        ]);
        
        // Registrar el lote inicial si hay cantidad
        $numero_lote_para_log = 'N/A';
        if ($cantidad > 0 && !empty($fecha_caducidad)) {
            if ($fecha_caducidad === '9999-12-31') {
                $fecha_str = "000000";
            } else {
                $fecha_obj = new DateTime($fecha_caducidad);
                $fecha_str = $fecha_obj->format('ymd');
            }
            $numero_lote_generado = "$codigo-001-$fecha_str";
            
            $sqlLote = "INSERT INTO lotes_producto (codigo_producto, numero_lote, fecha_caducidad, cantidad) 
                        VALUES (?, ?, ?, ?)";
            $stmtLote = $pdo->prepare($sqlLote);
            $stmtLote->execute([$codigo, $numero_lote_generado, $fecha_caducidad, $cantidad]);
            
            $numero_lote_para_log = $numero_lote_generado;
        }

        $mensaje = "Producto registrado exitosamente.";
        $detalles = "Producto nuevo registrado: $nombre. Cantidad: $cantidad, Lote: $numero_lote_para_log, Precio: $$precio";
    }

    $sqlLog = "INSERT INTO historial_productos (codigo_producto, accion, usuario_ci, detalles, fecha) 
                VALUES (?, ?, ?, ?, NOW())";
    
    $stmtLog = $pdo->prepare($sqlLog);
    $stmtLog->execute([$codigo, $accionHistorial, $vendedor_ci, $detalles]);

    $pdo->commit();

    echo json_encode(["status" => "success", "message" => $mensaje]);

} catch (PDOException $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();

    $errorInfo = $e->errorInfo;
    $mensajeRealDeMySQL = isset($errorInfo[2]) ? $errorInfo[2] : $e->getMessage(); 

    echo json_encode([
        "status" => "error", 
        "message" => "Error procesando solicitud: " . $mensajeRealDeMySQL
    ]);
}