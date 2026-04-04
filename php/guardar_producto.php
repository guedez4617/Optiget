<?php
header('Content-Type: application/json; charset=utf-8');
include 'db_conexion.php';

$input = file_get_contents("php://input");
$data = json_decode($input, true);

if (!$data || !isset($data['codigo'])) {
    echo json_encode(["status" => "error", "message" => "Datos incompletos"]);
    exit;
}

// Mapeo exacto según tu JS
$codigo    = $data['codigo'];
$categoria = $data['categoria'] ?? '';
$marca     = $data['marca'] ?? '';
$nombre    = $data['nombre'] ?? '';
$cantidad  = intval($data['cantidad'] ?? 0); // Tu JS envía 'cantidad'
$precio    = floatval($data['precio'] ?? 0);
$conIva    = intval($data['conIva'] ?? 0);   // Tu JS envía 'conIva'

try {
    // Lógica de auto-activación: Si hay stock, el estado es 1 (Activo)
    $nuevoEstado = ($cantidad > 0) ? 1 : 0;

    // Usamos INSERT ... ON DUPLICATE KEY UPDATE para que sirva para NUEVOS y EDICIÓN
    $sql = "INSERT INTO productos (codigo, categoria, marca, nombre, unidades, precio, `i.v.a.`, estado) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
                categoria = VALUES(categoria),
                marca = VALUES(marca),
                nombre = VALUES(nombre),
                unidades = VALUES(unidades),
                precio = VALUES(precio),
                `i.v.a.` = VALUES(`i.v.a.`),
                estado = VALUES(estado)";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        $codigo, 
        $categoria, 
        $marca, 
        $nombre, 
        $cantidad, 
        $precio, 
        $conIva, 
        $nuevoEstado
    ]);

    echo json_encode([
        "status" => "success", 
        "message" => "Producto guardado y " . ($nuevoEstado ? "activado" : "quedó como agotado")
    ]);

} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Error DB: " . $e->getMessage()]);
}