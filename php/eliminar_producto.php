<?php
// php/eliminar_producto.php
include 'db_conexion.php';
$data = json_decode(file_get_contents("php://input"), true);

if (isset($data['codigo'])) {
    try {
        $stmt = $pdo->prepare("DELETE FROM productos WHERE codigo = ?");
        $stmt->execute([$data['codigo']]);
        echo json_encode(["status" => "success"]);
    } catch (PDOException $e) {
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
}
?>