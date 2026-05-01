<?php
header('Content-Type: application/json');
include 'db_conexion.php';

$data = json_decode(file_get_contents("php://input"), true);

$cedula    = $data['cedula'];
$nombre    = $data['nombre'];
$apellido  = $data['apellido'];
$usuario   = $data['usuario'];
$clave     = $data['clave']; 
$rol       = $data['rol']; 
$telefono  = $data['telefono'];
$esEdicion = $data['esEdicion'];


$claveCifrada = password_hash($clave, PASSWORD_BCRYPT);

try {
    if (!$esEdicion) {
        $sql = "INSERT INTO usuarios (`C.I`, NOMBRE, APELLIDO, N_USUARIO, CONTRASEÑA, rol, telefono, estado) 
                VALUES (?, ?, ?, ?, ?, ?, ?, 1)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$cedula, $nombre, $apellido, $usuario, $claveCifrada, $rol, $telefono]);
        $msg = "Usuario registrado con éxito";
    } else {
        $sql = "UPDATE usuarios SET NOMBRE=?, APELLIDO=?, N_USUARIO=?, CONTRASEÑA=?, rol=?, telefono=? 
                WHERE `C.I`=?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$nombre, $apellido, $usuario, $claveCifrada, $rol, $telefono, $cedula]);
        $msg = "Datos actualizados con éxito";
    }

    echo json_encode(["status" => "success", "message" => $msg]);

} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Error: " . $e->getMessage()]);
}
?>