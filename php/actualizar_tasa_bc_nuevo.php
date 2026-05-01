<?php
include 'db_conexion.php';

function obtenerTasaDesdeBCV() {
    $url = 'https://ve.dolarapi.com/v1/dolares/oficial';
    if (function_exists('curl_version')) {
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 15);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0');
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        if ($httpCode == 200 && $response) {
            $data = json_decode($response, true);
            if (isset($data['promedio']) && floatval($data['promedio']) > 0) {
                return floatval($data['promedio']);
            }
        }
    } elseif (ini_get('allow_url_fopen')) {
        $context = stream_context_create([
            'http' => ['timeout' => 15, 'header' => "User-Agent: Mozilla/5.0\r\n"],
            'ssl' => ['verify_peer' => false, 'verify_peer_name' => false]
        ]);
        $response = @file_get_contents($url, false, $context);
        if ($response) {
            $data = json_decode($response, true);
            if (isset($data['promedio']) && floatval($data['promedio']) > 0) {
                return floatval($data['promedio']);
            }
        }
    }

    return false;
}

function obtenerTasaAlternativa() {
    $url = 'https://api.exchangerate.host/latest?base=USD&symbols=VES';
    if (function_exists('curl_version')) {
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 15);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0');
        $response = curl_exec($ch);
        curl_close($ch);
    } elseif (ini_get('allow_url_fopen')) {
        $context = stream_context_create([
            'http' => ['timeout' => 15, 'header' => "User-Agent: Mozilla/5.0\r\n"],
            'ssl' => ['verify_peer' => false, 'verify_peer_name' => false]
        ]);
        $response = @file_get_contents($url, false, $context);
    }

    if ($response) {
        $data = json_decode($response, true);
        if (isset($data['rates']['VES']) && floatval($data['rates']['VES']) > 0) {
            return floatval($data['rates']['VES']);
        }
    }
    return false;
}

$tasa = obtenerTasaDesdeBCV();
$origen = 'BCV';
if ($tasa === false) {
    $tasa = obtenerTasaAlternativa();
    $origen = 'externa';
}

if ($tasa === false) {
    echo json_encode(['status' => 'error', 'message' => 'No se pudo obtener la tasa']);
    exit;
}

$stmt = $pdo->prepare("UPDATE ajustes SET valor = ? WHERE clave = 'tasa_dolar'");
$stmt->execute([$tasa]);

echo json_encode(['status' => 'ok', 'tasa' => $tasa, 'origen' => $origen]);
