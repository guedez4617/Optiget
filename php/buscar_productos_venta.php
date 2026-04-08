<?php
header('Content-Type: application/json');
include 'db_conexion.php'; 

// Recibimos el texto de búsqueda y la categoría
$q = isset($_GET['q']) ? $_GET['q'] : '';
$cat = isset($_GET['cat']) ? $_GET['cat'] : 'todo'; // 'todo' por defecto

try {
    if ($q !== '') {
        $busqueda = "%$q%";
        
        // Definimos la base de la consulta
        $sql = "SELECT `Codigo` AS codigo, 
                        `nombre`, 
                        `marca`, 
                        `presentacion`, 
                        `precio`, 
                        `i.v.a.` AS iva, 
                        `unidades` 
                FROM productos 
                WHERE `unidades` > 0 ";

        // Filtramos según la categoría seleccionada en el JS
        if ($cat === 'codigo') {
            $sql .= " AND `Codigo` LIKE ? ";
            $params = [$busqueda];
        } elseif ($cat === 'marca') {
            $sql .= " AND `marca` LIKE ? ";
            $params = [$busqueda];
        } elseif ($cat === 'nombre') {
            $sql .= " AND `nombre` LIKE ? ";
            $params = [$busqueda];
        } else {
            // Si es 'todo' o no se reconoce, busca en los tres campos (como antes)
            $sql .= " AND (`Codigo` LIKE ? OR `nombre` LIKE ? OR `marca` LIKE ?) ";
            $params = [$busqueda, $busqueda, $busqueda];
        }

        $sql .= " LIMIT 15";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $productos = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode($productos);
    } else {
        echo json_encode([]);
    }
} catch (PDOException $e) {
    echo json_encode(["error" => "Error de base de datos: " . $e->getMessage()]);
}
?>