<?php
header('Content-Type: application/json');
include 'db_conexion.php';

$metodo = $_SERVER['REQUEST_METHOD'];

try {
    if ($metodo === 'GET') {
        $stmt = $pdo->query("SELECT * FROM datos_negocio ORDER BY id_config DESC LIMIT 1");
        $negocio = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($negocio) {
            echo json_encode($negocio);
        } else {
            echo json_encode([
                "nombre" => "",
                "rif" => "",
                "direccion" => "",
                "telefono" => ""
            ]);
        }
    } 
    
    else if ($metodo === 'POST') {
        $data = json_decode(file_get_contents("php://input"), true);
        $id_usuario = $data['id_usuario_cambio'] ?? null;

        if (!$id_usuario) {
            echo json_encode(["status" => "error", "message" => "No se identificó el usuario que realiza el cambio."]);
            exit;
        }

        $stmtAnt = $pdo->query("SELECT * FROM datos_negocio ORDER BY id_config DESC LIMIT 1");
        $negocioAnt = $stmtAnt->fetch(PDO::FETCH_ASSOC);

        $cambios = [];
        if ($negocioAnt) {
            if ($negocioAnt['nombre'] != $data['nombre']) $cambios[] = "Nombre: '{$negocioAnt['nombre']}' -> '{$data['nombre']}'";
            if ($negocioAnt['rif'] != $data['rif']) $cambios[] = "RIF: '{$negocioAnt['rif']}' -> '{$data['rif']}'";
            if ($negocioAnt['direccion'] != $data['direccion']) $cambios[] = "Dirección: '{$negocioAnt['direccion']}' -> '{$data['direccion']}'";
            if ($negocioAnt['telefono'] != $data['telefono']) $cambios[] = "Teléfono: '{$negocioAnt['telefono']}' -> '{$data['telefono']}'";
        }

        if (empty($cambios)) {
            $detalles_auditoria = "Actualizó información general (sin cambios detectables)";
        } else {
            $detalles_auditoria = "Se editó - " . implode(" | ", $cambios);
        }

        $sql = "INSERT INTO datos_negocio (nombre, rif, direccion, telefono, id_usuario_cambio, detalles_auditoria) 
                VALUES (?, ?, ?, ?, ?, ?)";
        
        $stmt = $pdo->prepare($sql);
        $res = $stmt->execute([
            $data['nombre'],
            $data['rif'],
            $data['direccion'],
            $data['telefono'],
            $id_usuario,
            $detalles_auditoria
        ]);

        echo json_encode(["status" => $res ? "success" : "error"]);
    }
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Error de Base de Datos: " . $e->getMessage()]);
}
?>