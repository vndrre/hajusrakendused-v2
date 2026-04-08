import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import laravel from 'laravel-vite-plugin';
import { defineConfig } from 'vite';
import { execSync } from 'node:child_process';

// Vercel build environments often don't have `php` installed.
// When `php` is missing, we must not even register the Wayfinder Vite plugin,
// because it executes `php artisan wayfinder:generate` during `vite build`.
let hasPhp = process.env.WAYFINDER_ASSUME_NO_PHP !== '1';

if (hasPhp) {
    try {
        execSync('php -v', { stdio: 'ignore' });
    } catch {
        hasPhp = false;
    }
}

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/js/app.ts'],
            ssr: 'resources/js/ssr.ts',
            refresh: true,
        }),
        tailwindcss(),
        vue({
            template: {
                transformAssetUrls: {
                    base: null,
                    includeAbsolute: false,
                },
            },
        }),
        ...(hasPhp
            ? [
                  wayfinder({
                      // On environments where `php` exists, allow Wayfinder to regenerate types.
                      routes: true,
                      actions: true,
                      formVariants: true,
                  }),
              ]
            : []),
    ],
});
