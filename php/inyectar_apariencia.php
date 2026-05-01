<?php
$htmlFiles = [];

function findHtmlFiles($dir) {
    global $htmlFiles;
    $items = glob($dir . '/*');
    foreach ($items as $item) {
        if (is_dir($item)) {
            findHtmlFiles($item);
        } else if (pathinfo($item, PATHINFO_EXTENSION) === 'html') {
            $htmlFiles[] = $item;
        }
    }
}

findHtmlFiles(__DIR__ . '/..');

$procesados = 0;
foreach ($htmlFiles as $file) {
    $content = file_get_contents($file);
    if (strpos($content, 'apariencia.js') === false) {
        // Calcular la ruta relativa para el script
        $pathParts = explode(DIRECTORY_SEPARATOR, realpath($file));
        $htdocsIndex = array_search('Optiget', $pathParts);
        $depth = count($pathParts) - $htdocsIndex - 2; // -1 por el nombre del archivo, -1 por Optiget
        
        $prefix = $depth <= 0 ? '' : str_repeat('../', $depth);
        $scriptTag = "<script src=\"{$prefix}javascript/apariencia.js\"></script>\n</body>";
        
        $newContent = str_replace('</body>', $scriptTag, $content);
        file_put_contents($file, $newContent);
        echo "✅ Modificado: " . basename($file) . "\n";
        $procesados++;
    }
}
echo "\nTotal HTMLs actualizados: $procesados\n";
?>
