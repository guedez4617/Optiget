<?php
include 'db_conexion.php';
$data = json_decode(file_get_contents("php://input"), true);
$nuevaTasa = $data['tasa'];
$stmt = $pdo->prepare("UPDATE ajustes SET valor = ? WHERE clave = 'tasa_dolar'");
$stmt->execute([$nuevaTasa]);
echo json_encode(['status' => 'ok']);
?>