<?php
include 'db_conexion.php';
session_start();

// Configurar cabecera para JSON
header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    echo json_encode(["status" => "error", "message" => "Datos no recibidos"]);
    exit;
}

$userIn = $data['usuario'];
$passIn = $data['password'];

try {
    // Buscamos al usuario por su nombre de usuario
    $stmt = $pdo->prepare("SELECT `C.I`, NOMBRE, APELLIDO, ROL, CONTRASEÑA FROM usuarios WHERE N_USUARIO = ?");
    $stmt->execute([$userIn]);
    $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

    // Verificamos si existe y si la contraseña coincide (usando el hash de la BD)
    if ($usuario && password_verify($passIn, $usuario['CONTRASEÑA'])) {
        
        // Guardamos datos en la Sesión de PHP (Servidor)
        $_SESSION['id_usuario'] = $usuario['C.I'];
        $_SESSION['nombre_usuario'] = $usuario['NOMBRE'] . " " . $usuario['APELLIDO'];
        $_SESSION['rol'] = $usuario['ROL'];

        // Eliminamos la contraseña del array antes de enviarlo al JS por seguridad
        unset($usuario['CONTRASEÑA']);
        
        echo json_encode([
            "status" => "success",
            "message" => "Acceso concedido",
            "usuario" => $usuario // Aquí viajan NOMBRE y APELLIDO
        ]);
    } else {
        echo json_encode(["status" => "error", "message" => "Usuario o contraseña incorrectos"]);
    }
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Error de base de datos: " . $e->getMessage()]);
}
?>