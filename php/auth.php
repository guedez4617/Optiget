<?php
// php/auth.php

/**
 * Verifica si el usuario tiene un permiso específico o es Gerente.
 */
function tienePermiso($permisoRequerido) {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    
    // Si no está logueado, directamente no tiene permisos
    if (!isset($_SESSION['rol'])) {
        return false;
    }

    // El Gerente siempre tiene permiso (usamos el nombre exacto de tu tabla roles)
    // O puedes usar el ID si prefieres: if ($_SESSION['id_rol'] == 1)
    if ($_SESSION['rol'] === 'Gerente') {
        return true;
    }

    // Verificamos si el permiso (ej: 'opcion-facturacion') está en su lista
    $permisosUsuario = $_SESSION['permisos'] ?? [];
    return in_array($permisoRequerido, $permisosUsuario);
}

/**
 * Corta la ejecución si el usuario no tiene permiso.
 * Úsalo al principio de tus archivos de guardado o borrado.
 */
function denegarAcceso() {
    header('Content-Type: application/json');
    echo json_encode([
        "status" => "error", 
        "message" => "Acceso denegado: No tienes los permisos necesarios para esta operación."
    ]);
    exit;
}