<?php
$urls = [
    'https://ve.dolarapi.com/v1/dolares/oficial',
    'https://api.exchangerate.host/latest?base=USD&symbols=VES',
    'https://pydolarvenezuela-api.vercel.app/api/v1/dollar?page=bcv'
];

foreach ($urls as $url) {
    echo "Probando $url:\n";
    if (function_exists('curl_version')) {
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0');
        $response = curl_exec($ch);
        $error = curl_error($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        if ($response !== false) {
            echo "  CURL: OK ($httpCode) - " . strlen($response) . " bytes\n";
        } else {
            echo "  CURL: FAIL - $error\n";
        }
    }

    if (ini_get('allow_url_fopen')) {
        $context = stream_context_create([
            'http' => ['timeout' => 10, 'header' => "User-Agent: Mozilla/5.0\r\n"],
            'ssl' => ['verify_peer' => false, 'verify_peer_name' => false]
        ]);
        $response = @file_get_contents($url, false, $context);
        if ($response !== false) {
            echo "  file_get_contents: OK - " . strlen($response) . " bytes\n";
        } else {
            echo "  file_get_contents: FAIL\n";
        }
    }
    echo "\n";
}
?>