<?php
header('Content-Type: application/json; charset=utf-8');
include 'db_conexion.php';

$input = file_get_contents("php://input");
$data = json_decode($input, true);

if (!$data || !isset($data['codigo'])) {
    echo json_encode(["status" => "error", "message" => "Datos incompletos"]);
    exit;
}

// Mapeo de datos recibidos del JS
$codigo       = trim($data['codigo']);
$categoria    = $data['categoria'] ?? '';
$marca        = $data['marca'] ?? '';
$nombre       = $data['nombre'] ?? '';
$presentacion = $data['presentacion'] ?? ''; // <-- NUEVO: Captura la presentación
$cantidad     = intval($data['cantidad'] ?? 0);
$precio       = floatval($data['precio'] ?? 0);
$conIva       = intval($data['conIva'] ?? 0);
$esEdicion    = isset($data['esEdicion']) && $data['esEdicion'] === true;

try {
    // Si hay stock, el estado es 1 (Activo), si no, 0 (Agotado)
    $nuevoEstado = ($cantidad > 0) ? 1 : 0;

    if ($esEdicion) {
        // --- LÓGICA DE ACTUALIZACIÓN (UPDATE) ---
        $sql = "UPDATE productos SET 
                categoria = ?, 
                marca = ?, 
                nombre = ?, 
                presentacion = ?, 
                unidades = ?, 
                precio = ?, 
                `i.v.a.` = ?, 
                estado = ? 
                WHERE codigo = ?";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $categoria, 
            $marca, 
            $nombre, 
            $presentacion, // <-- Se añade aquí
            $cantidad, 
            $precio, 
            $conIva, 
            $nuevoEstado, 
            $codigo
        ]);
        $mensaje = "Producto actualizado correctamente.";
        
    } else {
        // --- LÓGICA DE INSERCIÓN NUEVA (INSERT) ---
        $sql = "INSERT INTO productos (codigo, categoria, marca, nombre, presentacion, unidades, precio, `i.v.a.`, estado) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $codigo, 
            $categoria, 
            $marca, 
            $nombre, 
            $presentacion, // <-- Se añade aquí
            $cantidad, 
            $precio, 
            $conIva, 
            $nuevoEstado
        ]);
        $mensaje = "Producto registrado exitosamente.";
    }

    echo json_encode(["status" => "success", "message" => $mensaje]);

} catch (PDOException $e) {
    $errorInfo = $e->errorInfo;
    $mensajeRealDeMySQL = $errorInfo[2]; 

    echo json_encode([
        "status" => "error", 
        "message" => "MySQL dice: " . $mensajeRealDeMySQL
    ]);
}