<?php
// login.php
include 'db_conexion.php';
session_start();

$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    echo json_encode(["status" => "error", "message" => "Datos no recibidos"]);
    exit;
}

$userIn = $data['usuario'];
$passIn = $data['password'];

try {
    // Buscamos al usuario por su N_USUARIO
    $stmt = $pdo->prepare("SELECT `C.I`, NOMBRE, APELLIDO, ROL, CONTRASEÑA FROM usuarios WHERE N_USUARIO = ?");
    $stmt->execute([$userIn]);
    $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

    // Verificamos si el usuario existe y si la contraseña coincide con el Hash
    if ($usuario && password_verify($passIn, $usuario['CONTRASEÑA'])) {
        
        // No enviamos la contraseña de vuelta al navegador por seguridad
        unset($usuario['CONTRASEÑA']);
        
        echo json_encode([
            "status" => "success",
            "message" => "Acceso concedido",
            "usuario" => $usuario
        ]);
    } else {
        echo json_encode(["status" => "error", "message" => "Usuario o contraseña incorrectos"]);
    }
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Error de base de datos"]);
}
?>