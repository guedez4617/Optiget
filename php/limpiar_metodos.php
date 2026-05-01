<?php
include 'db_conexion.php';
$r1 = $pdo->exec("UPDATE abonos SET metodo_pago = 'Punto' WHERE metodo_pago = 'Efectivo \$'");
$r2 = $pdo->exec("UPDATE abonos SET metodo_pago = 'Pago Móvil' WHERE metodo_pago = 'Pago Movil'");
$r3 = $pdo->exec("UPDATE abonos SET metodo_pago = 'Biopago' WHERE metodo_pago = 'Transferencia'");

echo "Correcciones aplicadas:\n";
echo "- 'Efectivo \$' -> 'Punto': $r1 registros\n";
echo "- 'Pago Movil' -> 'Pago Móvil': $r2 registros\n";
echo "- 'Transferencia' -> 'Biopago': $r3 registros\n";

$final = $pdo->query("SELECT DISTINCT metodo_pago FROM abonos ORDER BY metodo_pago")->fetchAll(PDO::FETCH_COLUMN);
echo "\nMétodos actuales en la BD:\n";
print_r($final);
?>
