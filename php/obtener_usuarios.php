<?php
ob_start();
header('Content-Type: application/json');
include 'db_conexion.php';

try {
    // 1. Intentamos una consulta que sea tolerante a mayúsculas/minúsculas
    // Usamos LEFT JOIN por si algún usuario tiene un rol que no existe, para que NO desaparezca de la lista
    $sql = "SELECT u.*, r.nombre_rol 
            FROM usuarios u 
            LEFT JOIN roles r ON u.rol = r.id_rol 
            WHERE u.estado = 1";
            
    $stmt = $pdo->query($sql);
    $usuarios = $stmt->fetchAll(PDO::FETCH_ASSOC);

    ob_clean();
    
    // Si la consulta no trae nada, enviamos un mensaje de depuración interno
    if (!$usuarios) {
        echo json_encode(["debug" => "No se encontraron usuarios con estado 1"]);
    } else {
        echo json_encode($usuarios);
    }

} catch (PDOException $e) {
    ob_clean();
    echo json_encode(["error" => "Error de SQL: " . $e->getMessage()]);
}
?>