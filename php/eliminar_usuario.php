<?php
// eliminar_usuario.php
include 'db_conexion.php';

$data = json_decode(file_get_contents("php://input"), true);

if (isset($data['cedula'])) {
    try {
        $sql = "DELETE FROM usuarios WHERE `C.I` = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$data['cedula']]);
        echo json_encode(["status" => "success"]);
    } catch (PDOException $e) {
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
}
?>