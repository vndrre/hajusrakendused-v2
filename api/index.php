<?php

declare(strict_types=1);

ini_set('display_errors', '1');
error_reporting(E_ALL);

$autoloadPath = __DIR__.'/../vendor/autoload.php';

register_shutdown_function(function (): void {
    $error = error_get_last();

    if ($error === null) {
        return;
    }

    // If we crashed before producing output, return a message so we can debug on Vercel.
    if (($error['type'] ?? null) !== E_ERROR && ($error['type'] ?? null) !== E_PARSE && ($error['type'] ?? null) !== E_CORE_ERROR && ($error['type'] ?? null) !== E_COMPILE_ERROR) {
        return;
    }

    if (! headers_sent()) {
        http_response_code(500);
        header('content-type: text/plain; charset=utf-8');
    }

    echo 'Fatal error: '.($error['message'] ?? 'unknown')."\n";
});

if (! is_file($autoloadPath)) {
    http_response_code(500);
    header('content-type: text/plain; charset=utf-8');
    echo 'Missing vendor/autoload.php. Composer dependencies likely not installed in Vercel build.';
    exit;
}

try {
    require __DIR__.'/../public/index.php';
} catch (Throwable $e) {
    if (! headers_sent()) {
        http_response_code(500);
        header('content-type: text/plain; charset=utf-8');
    }

    echo 'Bootstrap exception: '.get_class($e).': '.$e->getMessage()."\n";
}
