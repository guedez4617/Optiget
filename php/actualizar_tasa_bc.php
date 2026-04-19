<?php
include 'db_conexion.php';

function obtenerHtmlBCV() {
    $url = 'https://www.bcv.org.ve/estadisticas/tipo-cambio-de-referencia-smc';
    if (function_exists('curl_version')) {
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 15);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (compatible; PHP script)');
        $html = curl_exec($ch);
        $err = curl_error($ch);
        curl_close($ch);
        if ($html !== false && !empty($html)) {
            return $html;
        } else {
            error_log("CURL error: $err");
        }
    }

    if (ini_get('allow_url_fopen')) {
        $context = stream_context_create([
            'http' => [
                'timeout' => 15,
                'header' => "User-Agent: Mozilla/5.0 (compatible; PHP script)\r\n"
            ],
            'ssl' => [
                'verify_peer' => false,
                'verify_peer_name' => false,
            ]
        ]);
        $html = @file_get_contents($url, false, $context);
        if ($html !== false && !empty($html)) {
            return $html;
        } else {
            error_log("file_get_contents failed for BCV");
        }
    }

    return false;
}

function parsearTasaBCV($html) {
    if (empty($html)) {
        return false;
    }

    $pattern = '/USD[^\d]*([0-9]{1,3}(?:[.,][0-9]{3})*[.,][0-9]+)/i';
    if (preg_match($pattern, $html, $matches)) {
        $valor = $matches[1];
        $valor = str_replace('.', '', $valor);
        $valor = str_replace(',', '.', $valor);
        return floatval($valor);
    }

    return false;
}

function obtenerTasaDesdeBCV() {
    $html = obtenerHtmlBCV();
    if (!$html) {
        return false;
    }

    $tasa = parsearTasaBCV($html);
    if ($tasa !== false && $tasa > 0) {
        return $tasa;
    }
    // Intentar con API alternativa para Venezuela
    $url = 'https://pydolarvenezuela-api.vercel.app/api/v1/dollar?page=bcv';
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
        if (isset($data['monitors']['bcv']['price']) && floatval($data['monitors']['bcv']['price']) > 0) {
            return floatval($data['monitors']['bcv']['price']);
        }
    }
    return false;
}

function obtenerTasaAlternativa() {
    $url = 'https://api.exchangerate.host/latest?base=USD&symbols=VES';
    if (function_exists('curl_version')) {
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 15);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (compatible; PHP script)');
        $response = curl_exec($ch);
        $err = curl_error($ch);
        curl_close($ch);
        if ($response === false) {
            error_log("CURL error alternativa: $err");
            return false;
        }
    } elseif (ini_get('allow_url_fopen')) {
        $context = stream_context_create([
            'http' => [
                'timeout' => 15,
                'header' => "User-Agent: Mozilla/5.0 (compatible; PHP script)\r\n"
            ],
            'ssl' => [
                'verify_peer' => false,
                'verify_peer_name' => false,
            ]
        ]);
        $response = @file_get_contents($url, false, $context);
        if ($response === false) {
            error_log("file_get_contents failed for alternativa");
            return false;
        }
    } else {
        return false;
    }

    if (!$response) {
        return false;
    }

    $data = json_decode($response, true);
    if (isset($data['rates']['VES']) && floatval($data['rates']['VES']) > 0) {
        return floatval($data['rates']['VES']);
    }
    error_log("Respuesta alternativa inválida: " . substr($response, 0, 200));
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
