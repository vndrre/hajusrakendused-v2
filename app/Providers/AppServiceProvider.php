<?php

namespace App\Providers;

use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
        $this->configureUrlGenerationForVercel();
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }

    /**
     * Vercel routes PHP through `api/index.php`, so Symfony derives a `/api` base path and
     * `asset()` / `@vite` would otherwise emit `/api/build/...` while static files are at `/build/...`.
     */
    protected function configureUrlGenerationForVercel(): void
    {
        if (! $this->isRunningOnVercel()) {
            return;
        }

        $root = rtrim((string) config('app.url'), '/');

        if ($root === '') {
            return;
        }

        if (Str::endsWith($root, '/api')) {
            $root = Str::beforeLast($root, '/api');
        }

        URL::forceRootUrl($root);
        URL::forceScheme('https');
    }

    protected function isRunningOnVercel(): bool
    {
        return isset($_SERVER['VERCEL']) || getenv('VERCEL') !== false;
    }
}
