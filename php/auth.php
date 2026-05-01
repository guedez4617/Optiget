<?php
function tienePermiso($permisoRequerido) {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
        if (!isset($_SESSION['rol'])) {
        return false;
    }

    if ($_SESSION['rol'] === 'Gerente') {
        return true;
    }
    $permisosUsuario = $_SESSION['permisos'] ?? [];
    return in_array($permisoRequerido, $permisosUsuario);
}

function denegarAcceso() {
    header('Content-Type: application/json');
    echo json_encode([
        "status" => "error", 
        "message" => "Acceso denegado: No tienes los permisos necesarios para esta operación."
    ]);
    exit;
}