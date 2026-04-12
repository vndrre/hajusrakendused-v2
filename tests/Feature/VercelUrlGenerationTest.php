<?php

use Illuminate\Support\Facades\URL;

afterEach(function (): void {
    putenv('VERCEL');
    unset($_SERVER['VERCEL']);
    putenv('APP_URL');
    unset($_ENV['APP_URL']);
});

test('vercel php entrypoint does not make asset urls use the /api base path', function (): void {
    putenv('VERCEL=1');
    $_SERVER['VERCEL'] = '1';
    putenv('APP_URL=https://vercel-app.test');
    $_ENV['APP_URL'] = 'https://vercel-app.test';

    $this->refreshApplication();

    $this->withServerVariables([
        'HTTP_HOST' => 'vercel-app.test',
        'SERVER_NAME' => 'vercel-app.test',
        'SERVER_PORT' => '443',
        'HTTPS' => 'on',
        'REQUEST_SCHEME' => 'https',
        'SCRIPT_NAME' => '/api/index.php',
        'PHP_SELF' => '/api/index.php',
        'REQUEST_URI' => '/up',
    ])->get('/up')->assertOk();

    expect(URL::asset('build/assets/app.js'))->toBe('https://vercel-app.test/build/assets/app.js');
});
