<?php
header('Content-Type: application/json');
include 'db_conexion.php';

$data = json_decode(file_get_contents("php://input"), true);
$cedula = $data['cedula'] ?? '';

if (empty($cedula)) {
    echo json_encode(["status" => "error", "message" => "Cédula no proporcionada"]);
    exit;
}

try {
    // CAMBIO: Ahora actualizamos el estado en lugar de borrar la fila
    $sql = "UPDATE usuarios SET estado = 0 WHERE `C.I` = :cedula";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':cedula' => $cedula]);

    echo json_encode(["status" => "success", "message" => "Usuario inhabilitado correctamente"]);
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>