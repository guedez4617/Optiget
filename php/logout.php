<?php
ob_start(); 
session_start();
header('Content-Type: application/json'); 

include 'db_conexion.php'; 

if (isset($_SESSION['id_sesion_auditoria'])) {
    try {
        $id_sesion = $_SESSION['id_sesion_auditoria'];
        $sql = "UPDATE auditoria_sesiones SET fecha_fin = NOW() WHERE id_sesion = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$id_sesion]);

    } catch (PDOException $e) {
        error_log("Error al cerrar sesión en auditoría: " . $e->getMessage());
    }
}


session_destroy();

ob_clean();
echo json_encode(["status" => "success"]);
exit; 
?>