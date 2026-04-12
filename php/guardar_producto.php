<?php
session_start(); // Fundamental para capturar la CI del usuario logueado
header('Content-Type: application/json; charset=utf-8');
include 'db_conexion.php';

// 1. Obtener el usuario responsable de la sesión
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

try {
    // Iniciamos transacción para que si falla el historial, no se guarde el producto (o viceversa)
    $pdo->beginTransaction();

    $nuevoEstado = ($cantidad > 0) ? 1 : 0;
    $accionHistorial = $esEdicion ? "EDICION" : "REGISTRO";

    if ($esEdicion) {
        // --- EDITAR PRODUCTO ---
        $sql = "UPDATE productos SET 
                categoria = ?, marca = ?, nombre = ?, presentacion = ?, 
                unidades = ?, precio = ?, `i.v.a.` = ?, estado = ? 
                WHERE Codigo = ?"; // Asegúrate de que en tu BD sea 'Codigo' con C mayúscula
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $categoria, $marca, $nombre, $presentacion,
            $cantidad, $precio, $conIva, $nuevoEstado, $codigo
        ]);
        $mensaje = "Producto actualizado correctamente.";
        
    } else {
        // --- NUEVO PRODUCTO ---
        $sql = "INSERT INTO productos (Codigo, categoria, marca, nombre, presentacion, unidades, precio, `i.v.a.`, estado) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $codigo, $categoria, $marca, $nombre, $presentacion,
            $cantidad, $precio, $conIva, $nuevoEstado
        ]);
        $mensaje = "Producto registrado exitosamente.";
    }

    // --- INSERTAR EN EL HISTORIAL ---
    // Esta parte conecta con tu nueva tabla
    $sqlLog = "INSERT INTO historial_productos (codigo_producto, accion, usuario_ci, detalles, fecha) 
                VALUES (?, ?, ?, ?, NOW())";
    
    $detalles = "Cambio realizado en: $nombre. Cantidad: $cantidad, Precio: $precio";
    
    $stmtLog = $pdo->prepare($sqlLog);
    $stmtLog->execute([$codigo, $accionHistorial, $vendedor_ci, $detalles]);

    // Confirmamos todos los cambios
    $pdo->commit();

    echo json_encode(["status" => "success", "message" => $mensaje]);

} catch (PDOException $e) {
    // Si algo falla, deshacemos todo lo anterior
    if ($pdo->inTransaction()) $pdo->rollBack();

    $errorInfo = $e->errorInfo;
    $mensajeRealDeMySQL = isset($errorInfo[2]) ? $errorInfo[2] : $e->getMessage(); 

    echo json_encode([
        "status" => "error", 
        "message" => "Error procesando solicitud: " . $mensajeRealDeMySQL
    ]);
}