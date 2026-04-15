<?php
// php/gestion_negocio.php
header('Content-Type: application/json');
include 'db_conexion.php';

$metodo = $_SERVER['REQUEST_METHOD'];

try {
    if ($metodo === 'GET') {
        // --- LÓGICA DE PRECARGA ---
        // Obtenemos la versión MÁS RECIENTE (la última insertada)
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
        // --- LÓGICA DE GUARDADO (VERSIONAMIENTO) ---
        $data = json_decode(file_get_contents("php://input"), true);
        
        // El id_usuario_cambio lo recibimos del JS (que lo saca del localStorage)
        $id_usuario = $data['id_usuario_cambio'] ?? null;

        if (!$id_usuario) {
            echo json_encode(["status" => "error", "message" => "No se identificó el usuario que realiza el cambio."]);
            exit;
        }

        // IMPORTANTE: Aquí hacemos un INSERT puro. No usamos UPDATE.
        // Cada cambio es una fila nueva para no dañar las facturas viejas.
        $sql = "INSERT INTO datos_negocio (nombre, rif, direccion, telefono, id_usuario_cambio) 
                VALUES (?, ?, ?, ?, ?)";
        
        $stmt = $pdo->prepare($sql);
        $res = $stmt->execute([
            $data['nombre'],
            $data['rif'],
            $data['direccion'],
            $data['telefono'],
            $id_usuario
        ]);

        echo json_encode(["status" => $res ? "success" : "error"]);
    }
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Error de Base de Datos: " . $e->getMessage()]);
}
?>