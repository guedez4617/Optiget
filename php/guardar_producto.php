<?php
header('Content-Type: application/json');
include 'db_conexion.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    echo json_encode(["status" => "error", "message" => "No se recibieron datos"]);
    exit;
}

$codigo    = $data['codigo'];
$categoria = $data['categoria'];
$marca     = $data['marca'];
$nombre    = $data['nombre'];
$unidades  = $data['cantidad']; 
$precio    = $data['precio']; // PHP lo recibe como float/decimal automáticamente
$iva       = $data['conIva'];   

try {
    $check = $pdo->prepare("SELECT codigo FROM productos WHERE codigo = ?");
    $check->execute([$codigo]);

    if ($check->rowCount() > 0) {
        // ACTUALIZAR
        $sql = "UPDATE productos SET categoria=?, marca=?, nombre=?, unidades=?, precio=?, `i.v.a.`=? WHERE codigo=?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$categoria, $marca, $nombre, $unidades, $precio, $iva, $codigo]);
        echo json_encode(["status" => "success", "message" => "Producto actualizado"]);
    } else {
        // INSERTAR
        $sql = "INSERT INTO productos (codigo, categoria, marca, nombre, unidades, precio, `i.v.a.`) VALUES (?, ?, ?, ?, ?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$codigo, $categoria, $marca, $nombre, $unidades, $precio, $iva]);
        echo json_encode(["status" => "success", "message" => "Producto guardado"]);
    }
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>