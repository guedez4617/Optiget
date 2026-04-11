<?php
header('Content-Type: application/json');
include 'db_conexion.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    echo json_encode(["status" => "error", "message" => "No se recibieron datos"]);
    exit;
}

$ci       = trim($data['cedula']);
$nombre   = trim($data['nombre']);
$apellido = trim($data['apellido']);
$user_log = trim($data['usuario']); 
$rol      = $data['rango'];
$telef    = trim($data['telefono']);
$esEdicion = $data['esEdicion'];
$clave_recibida = $data['clave'];

// Cifrar la clave (ya sea la cédula o la nueva clave fuerte)
$clave_segura = password_hash($clave_recibida, PASSWORD_BCRYPT);

try {
    if ($esEdicion) {
        // MODO EDICIÓN: Actualizamos todo incluyendo la nueva clave validada
        $sql = "UPDATE usuarios SET 
                NOMBRE = ?, 
                APELLIDO = ?, 
                N_USUARIO = ?, 
                CONTRASEÑA = ?, 
                ROL = ?, 
                telefono = ? 
                WHERE `C.I` = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$nombre, $apellido, $user_log, $clave_segura, $rol, $telef, $ci]);
        echo json_encode(["status" => "success", "message" => "Usuario actualizado con nueva clave fuerte."]);
    } else {
        // MODO NUEVO: Verificamos que no exista
        $check = $pdo->prepare("SELECT `C.I` FROM usuarios WHERE `C.I` = ?");
        $check->execute([$ci]);

        if ($check->rowCount() > 0) {
            echo json_encode(["status" => "error", "message" => "Esta cédula ya está registrada."]);
            exit;
        }

        $sql = "INSERT INTO usuarios (`C.I`, NOMBRE, APELLIDO, N_USUARIO, CONTRASEÑA, ROL, telefono) 
                VALUES (?, ?, ?, ?, ?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$ci, $nombre, $apellido, $user_log, $clave_segura, $rol, $telef]);
        echo json_encode(["status" => "success", "message" => "Usuario creado. Su clave provisional es su C.I."]);
    }
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Error SQL: " . $e->getMessage()]);
}
?>