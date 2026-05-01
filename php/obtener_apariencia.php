<?php
header('Content-Type: application/json');
include 'db_conexion.php';
try {
    $stmt = $pdo->query("SELECT color_tema, fondo_sistema, logo_sistema FROM datos_negocio ORDER BY id_config DESC LIMIT 1");
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    echo json_encode($row ?: [
        'color_tema'    => '#c54b00',
        'fondo_sistema' => 'frente.png',
        'logo_sistema'  => 'Picsart_25-11-28_15-24-13-139.png'
    ]);
} catch (Exception $e) {
    echo json_encode(['color_tema' => '#c54b00', 'fondo_sistema' => 'frente.png', 'logo_sistema' => 'Picsart_25-11-28_15-24-13-139.png']);
}
?>
