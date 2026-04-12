<?php
session_start();
header('Content-Type: application/json');
include 'db_conexion.php';

$data = json_decode(file_get_contents("php://input"), true);
$usuario_form = $data['usuario'] ?? '';
$password_form = $data['password'] ?? '';

try {
    $sql = "SELECT * FROM usuarios WHERE N_USUARIO = :u AND estado = 1 LIMIT 1";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':u' => $usuario_form]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    // Verificación (Usa password_verify si las contraseñas están hasheadas)
    if ($user && $password_form === $user['CONTRASEÑA']) {
        
        // --- VARIABLES DE SESIÓN BÁSICAS ---
        $_SESSION['ci_usuario'] = $user['C.I'];
        $_SESSION['rol'] = $user['ROL'];
        $_SESSION['nombre_usuario'] = $user['NOMBRE'] . " " . $user['APELLIDO'];

        // --- NUEVO: CARGAR PERMISOS DEL ROL ---
        $sqlP = "SELECT p.nombre_permiso 
                FROM rol_permisos rp 
                INNER JOIN permisos p ON rp.id_permiso = p.id_permiso 
                WHERE rp.rol = ?";
        $stmtP = $pdo->prepare($sqlP);
        $stmtP->execute([$user['ROL']]);
        
        // Guardamos solo los nombres de los permisos en un array simple
        // Ejemplo: ["gestionar_productos", "realizar_ventas"]
        $_SESSION['permisos'] = $stmtP->fetchAll(PDO::FETCH_COLUMN);

        echo json_encode([
            "status" => "success",
            "message" => "¡Bienvenido!",
            "usuario" => [
                "C.I" => $user['C.I'],
                "NOMBRE" => $user['NOMBRE'],
                "ROL" => $user['ROL'],
                "permisos" => $_SESSION['permisos'] // Opcional: enviarlos al JS
            ]
        ]);

    } else {
        echo json_encode(["status" => "error", "message" => "Credenciales incorrectas."]);
    }
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}