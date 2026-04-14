<?php
// Evitamos que cualquier error previo ensucie la respuesta
ob_start();
session_start();
header('Content-Type: application/json');

include 'db_conexion.php';

$data = json_decode(file_get_contents("php://input"), true);
$usuario_form = $data['usuario'] ?? '';
$password_form = $data['password'] ?? '';

try {
    // 1. Buscamos el usuario por su nombre de usuario
    $sql = "SELECT u.*, r.nombre_rol 
            FROM usuarios u 
            INNER JOIN roles r ON u.rol = r.id_rol 
            WHERE u.N_USUARIO = :u AND u.estado = 1 LIMIT 1";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':u' => $usuario_form]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    // --- CAMBIO CLAVE AQUÍ ---
    // password_verify compara el texto plano del formulario con el hash de la BD
    if ($user && password_verify($password_form, $user['CONTRASEÑA'])) {
        
        // Extraemos el ID del rol de forma segura
        $idRolActual = $user['rol'] ?? $user['ROL'];

        $_SESSION['ci_usuario'] = $user['CI'] ?? $user['C.I']; 
        $_SESSION['id_rol'] = $idRolActual;
        $_SESSION['rol'] = $user['nombre_rol'];
        $_SESSION['nombre_usuario'] = $user['NOMBRE'] . " " . $user['APELLIDO'];

        // 2. Cargar Permisos
        $sqlP = "SELECT p.nombre_permiso 
                 FROM rol_permisos rp 
                 INNER JOIN permisos p ON rp.id_permiso = p.id_permiso 
                 WHERE rp.id_rol = ?";
        
        $stmtP = $pdo->prepare($sqlP);
        $stmtP->execute([$idRolActual]);
        
        $listaPermisos = $stmtP->fetchAll(PDO::FETCH_COLUMN);
        $_SESSION['permisos'] = $listaPermisos;

        // Limpiamos el buffer
        ob_clean();

        echo json_encode([
            "status" => "success",
            "message" => "¡Bienvenido " . $user['nombre_rol'] . "!",
            "usuario" => [
                "CI" => $_SESSION['ci_usuario'],
                "NOMBRE" => $user['NOMBRE'],
                "APELLIDO" => $user['APELLIDO'],
                "nombre_rol" => $user['nombre_rol'],
                "rol_id" => $idRolActual
            ],
            "permisos" => $listaPermisos
        ]);

    } else {
        // Si el usuario no existe o la contraseña no coincide con el hash
        ob_clean();
        echo json_encode(["status" => "error", "message" => "Usuario o contraseña incorrectos."]);
    }
} catch (PDOException $e) {
    ob_clean();
    echo json_encode(["status" => "error", "message" => "Error de BD: " . $e->getMessage()]);
}
?>