<?php
header('Content-Type: application/json');
include 'db_conexion.php'; 

$data = json_decode(file_get_contents("php://input"), true);

$cedula = $data['cedula'];
$telefono = $data['telefono'];
$password = !empty($data['password']) ? $data['password'] : null;

try {
    if ($password) {
        $passwordHash = password_hash($password, PASSWORD_BCRYPT);
        $sql = "UPDATE usuarios SET telefono = ?, CONTRASEÑA = ? WHERE `C.I` = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$telefono, $passwordHash, $cedula]);
    } else {
        $sql = "UPDATE usuarios SET telefono = ? WHERE `C.I` = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$telefono, $cedula]);
    }

    echo json_encode(["status" => "success", "message" => "Datos actualizados"]);

} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>