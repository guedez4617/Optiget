<?php
session_start(); // NECESARIO para capturar quién está logueado
header('Content-Type: application/json; charset=utf-8');
include 'db_conexion.php';

// 1. Capturamos al usuario responsable desde la sesión
$vendedor_ci = $_SESSION['ci_usuario'] ?? null;

if (!$vendedor_ci) {
    echo json_encode(["status" => "error", "mensaje" => "Sesión no iniciada"]);
    exit;
}

// 2. Captura el JSON del frontend
$input = file_get_contents("php://input");
$data = json_decode($input, true);

if (!isset($data['codigo'])) {
    echo json_encode(["status" => "error", "mensaje" => "Código no recibido"]);
    exit;
}

$codigo = $data['codigo'];

try {
    $pdo->beginTransaction(); // Iniciamos transacción para seguridad

    // 3. Inhabilitar el producto (Cambio de estado)
    $sql = "UPDATE productos SET estado = 0 WHERE Codigo = ?"; // Asegúrate que 'Codigo' sea con C mayúscula si así está en tu BD
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$codigo]);

    if ($stmt->rowCount() > 0) {
        
        // 4. REGISTRAR EN EL HISTORIAL
        // Insertamos quién lo inhabilitó y cuándo
        $sqlLog = "INSERT INTO historial_productos (codigo_producto, accion, usuario_ci, detalles, fecha) 
                    VALUES (?, 'INHABILITACION', ?, 'El usuario desactivó este producto del inventario', NOW())";
        
        $stLog = $pdo->prepare($sqlLog);
        $stLog->execute([$codigo, $vendedor_ci]);

        $pdo->commit(); // Guardamos cambios definitivos
        echo json_encode(["status" => "ok", "mensaje" => "Producto inhabilitado y registrado en historial"]);
    } else {
        $pdo->rollBack();
        echo json_encode(["status" => "error", "mensaje" => "No se encontró el producto o ya estaba inhabilitado"]);
    }

} catch (PDOException $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    echo json_encode(["status" => "error", "mensaje" => "Error de BD: " . $e->getMessage()]);
}