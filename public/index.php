<?php

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Determine if the application is in maintenance mode...
if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
    require $maintenance;
}

// Register the Composer autoloader...
require __DIR__.'/../vendor/autoload.php';

// Vercel runs behind HTTPS. Laravel reads `APP_URL` during bootstrap/config loading,
// so set it before requiring `bootstrap/app.php` to avoid generating HTTP asset URLs.
if (isset($_SERVER['VERCEL']) || getenv('VERCEL') !== false) {
    $host = $_SERVER['HTTP_HOST'] ?? getenv('VERCEL_URL') ?: null;
    if (is_string($host) && $host !== '') {
        $httpsUrl = 'https://'.$host;
        $appUrl = (string) getenv('APP_URL');
        if ($appUrl === '' || str_starts_with($appUrl, 'http://')) {
            putenv('APP_URL='.$httpsUrl);
            $_ENV['APP_URL'] = $httpsUrl;
            $_SERVER['APP_URL'] = $httpsUrl;
        }
    }
}

// Bootstrap Laravel and handle the request...
/** @var Application $app */
$app = require_once __DIR__.'/../bootstrap/app.php';

// Vercel's filesystem is mostly read-only (e.g. /var/task). Laravel still expects
// `storage/` and `bootstrap/cache/` to be writable, so redirect them to /tmp.
if (isset($_SERVER['VERCEL']) || getenv('VERCEL') !== false) {
    $tmpRoot = '/tmp/laravel';
    $storagePath = $tmpRoot.'/storage';
    $bootstrapPath = $tmpRoot.'/bootstrap';

    // Ensure Laravel's common writable directories exist.
    @mkdir($storagePath.'/logs', 0777, true);
    @mkdir($storagePath.'/framework/cache', 0777, true);
    @mkdir($storagePath.'/framework/sessions', 0777, true);
    @mkdir($storagePath.'/framework/views', 0777, true);
    @mkdir($storagePath.'/app', 0777, true);
    @mkdir($bootstrapPath.'/cache', 0777, true);

    $app->useStoragePath($storagePath);
    $app->useBootstrapPath($bootstrapPath);

    // Vercel runs behind HTTPS, but Laravel/Symfony can still infer the incoming
    // scheme as HTTP depending on proxy headers/trust settings.
    // Force server/proxy values to make `url()` / `asset()` generate `https://...`.
    $_SERVER['HTTPS'] = 'on';
    $_SERVER['SERVER_PORT'] = 443;
    $_SERVER['REQUEST_SCHEME'] = 'https';
    $_SERVER['HTTP_X_FORWARDED_PROTO'] = 'https';

    // Best-effort: also force the URL generator (only if its binding is available).
    try {
        $app->make('url')->forceScheme('https');
    } catch (Throwable $e) {
        // Don't crash early.
    }
}

$app->handleRequest(Request::capture());
