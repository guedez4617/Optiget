<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
include 'db_conexion.php';

$vendedor_ci = $_SESSION['ci_usuario'] ?? null;

if (!$vendedor_ci) {
    echo json_encode(["status" => "error", "mensaje" => "Sesión no iniciada"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
$codigo = $data['codigo'] ?? null;

if (!$codigo) {
    echo json_encode(["status" => "error", "mensaje" => "Código no recibido"]);
    exit;
}

try {
    $pdo->beginTransaction();

    $sql = "UPDATE productos SET estado = 1 WHERE Codigo = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$codigo]);

    if ($stmt->rowCount() > 0) {
        $sqlLog = "INSERT INTO historial_productos (codigo_producto, accion, usuario_ci, detalles, fecha) 
                    VALUES (?, 'HABILITACION', ?, 'El usuario reactivó este producto del inventario', NOW())";
        
        $stLog = $pdo->prepare($sqlLog);
        $stLog->execute([$codigo, $vendedor_ci]);

        $pdo->commit();
        echo json_encode(["status" => "ok", "mensaje" => "Producto reactivado correctamente y registrado en el historial"]);
    } else {
        $pdo->rollBack();
        echo json_encode(["status" => "error", "mensaje" => "No se encontró el producto o ya estaba activado"]);
    }
} catch (PDOException $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    echo json_encode(["status" => "error", "mensaje" => "Error de BD: " . $e->getMessage()]);
}