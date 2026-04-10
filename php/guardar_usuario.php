<?php
include 'db_conexion.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    echo json_encode(["status" => "error", "message" => "No se recibieron datos"]);
    exit;
}

$ci       = $data['cedula'];
$nombre   = $data['nombre'];
$apellido = $data['apellido'];
$user_log = $data['usuario']; 
$rol      = $data['rango'];
$telef    = $data['telefono'];

//cifra la contraceña
$clave_plana = $data['clave'];
$clave_segura = password_hash($clave_plana, PASSWORD_BCRYPT);

try {
    $check = $pdo->prepare("SELECT `C.I` FROM usuarios WHERE `C.I` = ?");
    $check->execute([$ci]);

    if ($check->rowCount() > 0) {
        //editar
        // Si se cambia la clave se guarda el nuevo hash
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
        echo json_encode(["status" => "success", "message" => "Usuario actualizado con clave segura"]);
    } else {
        // nuevo usuario
        $sql = "INSERT INTO usuarios (`C.I`, NOMBRE, APELLIDO, N_USUARIO, CONTRASEÑA, ROL, telefono) 
                VALUES (?, ?, ?, ?, ?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$ci, $nombre, $apellido, $user_log, $clave_segura, $rol, $telef]);
        echo json_encode(["status" => "success", "message" => "Usuario registrado con éxito"]);
    }
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Error SQL: " . $e->getMessage()]);
}
?>