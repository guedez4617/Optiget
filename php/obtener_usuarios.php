<?php
header('Content-Type: application/json');
include 'db_conexion.php';

try {
    // IMPORTANTE: Verifica que la columna se llame estado y C.I en tu tabla
    $sql = "SELECT `C.I`, NOMBRE, APELLIDO, telefono, ROL, N_USUARIO, estado FROM usuarios WHERE estado = 1";
    $stmt = $pdo->query($sql);
    $usuarios = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($usuarios);
} catch (PDOException $e) {
    echo json_encode(["error" => "Error en la base de datos: " . $e->getMessage()]);
}
?>