<?php
header('Content-Type: application/json');
include 'db_conexion.php'; // Tu archivo de conexión PDO

$metodo = $_SERVER['REQUEST_METHOD'];

// --- ACCIÓN: BUSCAR ---
if ($metodo === 'GET' && isset($_GET['cedula'])) {
    $cedula = $_GET['cedula'];
    // Usamos `c.i` con comillas invertidas por el punto
    $stmt = $pdo->prepare("SELECT `c.i` as cedula, NOMBRE as nombre, telefono, correo, direccion FROM clientes WHERE `c.i` = ?");
    $stmt->execute([$cedula]);
    $cliente = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($cliente) {
        echo json_encode($cliente);
    } else {
        echo json_encode(["nuevo" => true]);
    }
    exit;
}

// --- ACCIÓN: GUARDAR / ACTUALIZAR ---
if ($metodo === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    $cedula = $data['cedula'];
    $nombre = $data['nombre'];
    $telefono = $data['telefono'];
    $correo = $data['correo'];
    $direccion = $data['direccion'];

    // Verificamos si existe usando `c.i`
    $check = $pdo->prepare("SELECT `c.i` FROM clientes WHERE `c.i` = ?");
    $check->execute([$cedula]);
    $existe = $check->fetch();

    if ($existe) {
        // Actualizar
        $sql = "UPDATE clientes SET NOMBRE=?, telefono=?, correo=?, direccion=? WHERE `c.i`=?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$nombre, $telefono, $correo, $direccion, $cedula]);
        $mensaje = "Datos actualizados";
    } else {
        // Insertar nuevo
        $sql = "INSERT INTO clientes (`c.i`, NOMBRE, telefono, correo, direccion) VALUES (?, ?, ?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$cedula, $nombre, $telefono, $correo, $direccion]);
        $mensaje = "Cliente registrado";
    }

    echo json_encode(["status" => "ok", "mensaje" => $mensaje]);
    exit;
}
?>