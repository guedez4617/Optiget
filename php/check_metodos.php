<?php
include 'db_conexion.php';
$r = $pdo->query("SELECT DISTINCT metodo_pago FROM abonos ORDER BY metodo_pago")->fetchAll(PDO::FETCH_COLUMN);
print_r($r);
?>
