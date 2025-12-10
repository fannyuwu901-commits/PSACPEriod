<?php
// papelera_obtener.php - Obtener elementos de la papelera

header('Content-Type: application/json; charset=utf-8');
session_start();
$conn = new mysqli("localhost", "root", "", "periodico_psac");
$conn->set_charset("utf8");

try {
    // Verificar que el usuario sea admin o editor
    if (!isset($_SESSION['usuario_rol']) || !in_array($_SESSION['usuario_rol'], ['admin', 'editor'])) {
        throw new Exception('No tienes permiso para acceder a la papelera');
    }

    $elementos = [];

    // Obtener publicaciones eliminadas
    $sql_publicaciones = "
        SELECT 
            id,
            'publicacion' as tipo,
            SUBSTRING(contenido, 1, 100) as titulo,
            contenido,
            area,
            archivo,
            creado as fecha_creacion,
            fecha_eliminacion,
            eliminado_por
        FROM publicaciones_papelera
        ORDER BY fecha_eliminacion DESC
    ";

    $result_pub = $conn->query($sql_publicaciones);
    if ($result_pub) {
        while ($row = $result_pub->fetch_assoc()) {
            $elementos[] = $row;
        }
    }

    // Obtener noticias eliminadas
    $sql_noticias = "
        SELECT 
            id,
            'noticia' as tipo,
            titulo,
            descripcion,
            categoria as area,
            imagen_principal,
            creado as fecha_creacion,
            fecha_eliminacion,
            eliminado_por
        FROM noticias_papelera
        ORDER BY fecha_eliminacion DESC
    ";

    $result_not = $conn->query($sql_noticias);
    if ($result_not) {
        while ($row = $result_not->fetch_assoc()) {
            $elementos[] = $row;
        }
    }

    // Ordenar por fecha de eliminación descendente
    usort($elementos, function($a, $b) {
        return strtotime($b['fecha_eliminacion']) - strtotime($a['fecha_eliminacion']);
    });

    echo json_encode([
        'success' => true,
        'elementos' => $elementos,
        'total' => count($elementos)
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

$conexion->close();
?>