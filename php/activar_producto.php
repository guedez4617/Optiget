<?php
header('Content-Type: application/json; charset=utf-8');
include 'db_conexion.php';

$data = json_decode(file_get_contents("php://input"), true);
$codigo = $data['codigo'] ?? null;

if (!$codigo) {
    echo json_encode(["status" => "error", "mensaje" => "Código no recibido"]);
    exit;
}

try {
    // Volvemos a poner estado en 1
    $sql = "UPDATE productos SET estado = 1 WHERE codigo = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$codigo]);

    echo json_encode(["status" => "ok", "mensaje" => "Producto reactivado correctamente"]);
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "mensaje" => $e->getMessage()]);
}