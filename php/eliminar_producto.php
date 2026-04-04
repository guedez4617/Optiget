<?php
header('Content-Type: application/json; charset=utf-8');
include 'db_conexion.php';

// Capturamos el JSON
$input = file_get_contents("php://input");
$data = json_decode($input, true);

if (!isset($data['codigo'])) {
    echo json_encode(["status" => "error", "mensaje" => "Código no recibido"]);
    exit;
}

$codigo = $data['codigo'];

try {
    // Borrado lógico: Actualizamos el estado a 0
    $sql = "UPDATE productos SET estado = 0 WHERE codigo = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$codigo]);

    if ($stmt->rowCount() > 0) {
        echo json_encode(["status" => "ok", "mensaje" => "Producto eliminado del inventario"]);
    } else {
        echo json_encode(["status" => "error", "mensaje" => "No se encontró el producto"]);
    }
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "mensaje" => $e->getMessage()]);
}
// Fin del archivo