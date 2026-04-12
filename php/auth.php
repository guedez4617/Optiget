<?php
// php/auth.php

function tienePermiso($permisoRequerido) {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    
    // Si el usuario es 'Administrador', le damos paso libre a todo (opcional)
    if (isset($_SESSION['rol']) && $_SESSION['rol'] === 'Administrador') {
        return true;
    }

    // Verificamos si el permiso está en su lista de permisos guardada al loguear
    $permisosUsuario = $_SESSION['permisos'] ?? [];
    return in_array($permisoRequerido, $permisosUsuario);
}

function denegarAcceso() {
    header('Content-Type: application/json');
    echo json_encode(["status" => "error", "mensaje" => "No tienes permisos para realizar esta acción."]);
    exit;
}