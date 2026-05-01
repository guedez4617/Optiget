<?php
header('Content-Type: application/json');
include 'db_conexion.php'; 

$codigo = isset($_GET['codigo']) ? $_GET['codigo'] : '';

if (empty($codigo)) {
    echo json_encode(["existe" => false]);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT nombre FROM productos WHERE Codigo = ? LIMIT 1");
    $stmt->execute([$codigo]);
    $producto = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($producto) {
        echo json_encode([
            "existe" => true,
            "nombre" => $producto['nombre']
        ]);
    } else {
        echo json_encode(["existe" => false]);
    }

} catch (PDOException $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
?>