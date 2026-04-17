<?php
ob_start();
session_start();
header('Content-Type: application/json');

include 'db_conexion.php';

$data = json_decode(file_get_contents("php://input"), true);
$usuario_form = $data['usuario'] ?? '';
$password_form = $data['password'] ?? '';

try {
    $sql = "SELECT u.*, r.nombre_rol 
            FROM usuarios u 
            INNER JOIN roles r ON u.rol = r.id_rol 
            WHERE u.N_USUARIO = :u AND u.estado = 1 LIMIT 1";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':u' => $usuario_form]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user && password_verify($password_form, $user['CONTRASEÑA'])) {
        
        $idRolActual = $user['rol'] ?? $user['ROL'];
        $ci_final = $user['CI'] ?? $user['C.I'];

        $_SESSION['ci_usuario'] = $ci_final; 
        $_SESSION['id_rol'] = $idRolActual;
        $_SESSION['rol'] = $user['nombre_rol'];
        $_SESSION['nombre_usuario'] = $user['NOMBRE'] . " " . $user['APELLIDO'];

        $ip_usuario = $_SERVER['REMOTE_ADDR'] ?? 'Desconocida';
        $sql_aud = "INSERT INTO auditoria_sesiones (usuario_ci, fecha_inicio, ip_direccion) VALUES (?, NOW(), ?)";
        $stmt_aud = $pdo->prepare($sql_aud);
        $stmt_aud->execute([$ci_final, $ip_usuario]);
        
        $_SESSION['id_sesion_auditoria'] = $pdo->lastInsertId();

        $sqlP = "SELECT p.nombre_permiso 
                FROM rol_permisos rp 
                INNER JOIN permisos p ON rp.id_permiso = p.id_permiso 
                WHERE rp.id_rol = ?";
        
        $stmtP = $pdo->prepare($sqlP);
        $stmtP->execute([$idRolActual]);
        $listaPermisos = $stmtP->fetchAll(PDO::FETCH_COLUMN);
        $_SESSION['permisos'] = $listaPermisos;

        ob_clean();

        echo json_encode([
            "status" => "success",
            "message" => "¡Bienvenido " . $user['nombre_rol'] . "!",
            "usuario" => [
                "CI"         => $ci_final,
                "NOMBRE"     => $user['NOMBRE'],
                "APELLIDO"   => $user['APELLIDO'],
                "N_USUARIO"  => $user['N_USUARIO'],
                "telefono"   => $user['telefono'],
                "nombre_rol" => $user['nombre_rol'],
                "rol_id"     => $idRolActual
            ],
            "permisos" => $listaPermisos
        ]);

    } else {
        ob_clean();
        echo json_encode(["status" => "error", "message" => "Usuario o contraseña incorrectos."]);
    }
} catch (PDOException $e) {
        ob_clean();
        echo json_encode(["status" => "error", "message" => "Error de BD: " . $e->getMessage()]);
}
?>