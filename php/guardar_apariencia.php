<?php
header('Content-Type: application/json');
include 'db_conexion.php';

$uploadDir = __DIR__ . '/../imagenes/';

$color   = $_POST['color_tema'] ?? null;
$fondoNombre = null;
$logoNombre  = null;

// Subir imagen de fondo
if (!empty($_FILES['fondo_sistema']['name'])) {
    $ext = pathinfo($_FILES['fondo_sistema']['name'], PATHINFO_EXTENSION);
    $fondoNombre = 'fondo_sistema.' . $ext;
    move_uploaded_file($_FILES['fondo_sistema']['tmp_name'], $uploadDir . $fondoNombre);
}

// Subir logo
if (!empty($_FILES['logo_sistema']['name'])) {
    $ext = pathinfo($_FILES['logo_sistema']['name'], PATHINFO_EXTENSION);
    $logoNombre = 'logo_sistema.' . $ext;
    move_uploaded_file($_FILES['logo_sistema']['tmp_name'], $uploadDir . $logoNombre);
}

// Obtener valores actuales si no se envió alguno
$stmt = $pdo->query("SELECT color_tema, fondo_sistema, logo_sistema FROM datos_negocio ORDER BY id_config DESC LIMIT 1");
$actual = $stmt->fetch(PDO::FETCH_ASSOC) ?: [];

$colorFinal = $color    ?: ($actual['color_tema']    ?? '#c54b00');
$fondoFinal = $fondoNombre ?: ($actual['fondo_sistema'] ?? 'frente.png');
$logoFinal  = $logoNombre  ?: ($actual['logo_sistema']  ?? 'Picsart_25-11-28_15-24-13-139.png');

try {
    $upd = $pdo->prepare("UPDATE datos_negocio SET color_tema = ?, fondo_sistema = ?, logo_sistema = ? 
                          WHERE id_config = (SELECT MAX(id_config) FROM (SELECT id_config FROM datos_negocio) AS t)");
    $upd->execute([$colorFinal, $fondoFinal, $logoFinal]);

    echo json_encode([
        'status'        => 'ok',
        'color_tema'    => $colorFinal,
        'fondo_sistema' => $fondoFinal,
        'logo_sistema'  => $logoFinal
    ]);
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'mensaje' => $e->getMessage()]);
}
?>
