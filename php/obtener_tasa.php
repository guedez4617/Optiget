<?php
include 'db_conexion.php';
$stmt = $pdo->prepare("SELECT valor FROM ajustes WHERE clave = 'tasa_dolar'");
$stmt->execute();
$res = $stmt->fetch(PDO::FETCH_ASSOC);
echo json_encode(['tasa' => $res['valor'] ?? '1.00']);
?>