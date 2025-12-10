<?php
// papelera_vaciar.php - Vaciar toda la papelera

header('Content-Type: application/json; charset=utf-8');
session_start();

$conexion = new mysqli("localhost", "root", "", "periodico_psac");
$conexion->set_charset("utf8");

try {
    if (!isset($_SESSION['usuario_rol']) || $_SESSION['usuario_rol'] !== 'admin') {
        throw new Exception('Solo administradores pueden vaciar la papelera');
    }

    // Obtener archivos de publicaciones
    $sql = "SELECT media FROM publicaciones_papelera WHERE media IS NOT NULL";
    $result = $conexion->query($sql);
    
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            if ($row['media']) {
                $file_path = "../" . $row['media'];
                if (file_exists($file_path)) {
                    unlink($file_path);
                }
            }
        }
    }

    // Obtener imágenes de noticias
    $sql = "SELECT imagen FROM noticias_papelera WHERE imagen IS NOT NULL";
    $result = $conexion->query($sql);
    
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            if ($row['imagen']) {
                $file_path = "../" . $row['imagen'];
                if (file_exists($file_path)) {
                    unlink($file_path);
                }
            }
        }
    }

    // Vaciar papeleras
    $conexion->query("TRUNCATE TABLE publicaciones_papelera");
    $conexion->query("TRUNCATE TABLE noticias_papelera");

    // Registrar en log
    $log_message = "Papelera vaciada por " . $_SESSION['usuario_id'];
    $sql_log = "INSERT INTO actividad_log (usuario_id, accion, descripcion) VALUES (?, 'papelera_vaciada', ?)";
    $stmt = $conexion->prepare($sql_log);
    $stmt->bind_param("is", $_SESSION['usuario_id'], $log_message);
    $stmt->execute();

    echo json_encode([
        'success' => true,
        'message' => 'Papelera vaciada correctamente'
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

$conexion->close();
?>