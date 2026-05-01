<?php
$cssDir = __DIR__ . '/../css/';
$files = glob($cssDir . '*.css');

$reemplazos = [
    '#c54b00'                                   => 'var(--color-tema, #c54b00)',
    'url("../imagenes/frente.png")'              => 'var(--fondo-sistema, url("../imagenes/frente.png"))',
    "url('../imagenes/frente.png')"              => 'var(--fondo-sistema, url("../imagenes/frente.png"))',
];

$procesados = 0;
foreach ($files as $file) {
    $contenido = file_get_contents($file);
    $nuevo = str_replace(array_keys($reemplazos), array_values($reemplazos), $contenido);
    if ($nuevo !== $contenido) {
        file_put_contents($file, $nuevo);
        echo "✅ Actualizado: " . basename($file) . "\n";
        $procesados++;
    } else {
        echo "⬜ Sin cambios: " . basename($file) . "\n";
    }
}
echo "\nTotal archivos actualizados: $procesados\n";
?>
