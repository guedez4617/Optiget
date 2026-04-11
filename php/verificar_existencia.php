<?php
header('Content-Type: application/json');
include 'db_conexion.php';

$ci = $_GET['ci'] ?? '';

$stmt = $pdo->prepare("SELECT NOMBRE, APELLIDO FROM usuarios WHERE `C.I` = ?");
$stmt->execute([$ci]);
$u = $stmt->fetch();

if ($u) {
    echo json_encode(["existe" => true, "nombre" => $u['NOMBRE'] . " " . $u['APELLIDO']]);
} else {
    echo json_encode(["existe" => false]);
}
?>