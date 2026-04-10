<?php

include 'db_conexion.php';

try {
    // tae los datos de usuario
    $stmt = $pdo->query("SELECT `C.I`, NOMBRE, APELLIDO, N_USUARIO, CONTRASEÑA, ROL, telefono FROM usuarios");
    $usuarios = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($usuarios);
} catch (PDOException $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
?>