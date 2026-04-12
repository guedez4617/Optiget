<?php
header('Content-Type: application/json');
include 'db_conexion.php';

$data = json_decode(file_get_contents("php://input"), true);

$cedula = $data['cedula'];
$nombre = $data['nombre'];
$apellido = $data['apellido'];
$usuario = $data['usuario'];
$clave = $data['clave'];
$rango = $data['rango'];
$telefono = $data['telefono'];
$esEdicion = $data['esEdicion'];

try {
    if (!$esEdicion) {
        // REGISTRO NUEVO: Forzamos estado = 1
        $sql = "INSERT INTO usuarios (`C.I`, NOMBRE, APELLIDO, N_USUARIO, CONTRASEÑA, ROL, telefono, estado) 
                VALUES (?, ?, ?, ?, ?, ?, ?, 1)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$cedula, $nombre, $apellido, $usuario, $clave, $rango, $telefono]);
        $msg = "Usuario registrado y activado con éxito";
    } else {
        // EDICIÓN
        $sql = "UPDATE usuarios SET NOMBRE=?, APELLIDO=?, N_USUARIO=?, CONTRASEÑA=?, ROL=?, telefono=? 
                WHERE `C.I`=?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$nombre, $apellido, $usuario, $clave, $rango, $telefono, $cedula]);
        $msg = "Datos actualizados con éxito";
    }

    echo json_encode(["status" => "success", "message" => $msg]);

} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Error: " . $e->getMessage()]);
}
?>