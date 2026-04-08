import { createInertiaApp, router } from '@inertiajs/vue3';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import type { DefineComponent } from 'vue';
import { createApp, h } from 'vue';
import './bootstrap';
import '../css/app.css';
import { initializeTheme } from '@/composables/useAppearance';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.vue`,
            import.meta.glob<DefineComponent>('./pages/**/*.vue'),
        ),
    setup({ el, App, props, plugin }) {
        createApp({ render: () => h(App, props) })
            .use(plugin)
            .mount(el);
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on page load...
initializeTheme();

// Background refresh to avoid stale props/state after client-side navigations.
// After every navigation success, we trigger exactly one reload of the same URL.
// We guard against infinite loops by skipping the reload-success handler once.
let lastVisitedUrl: string | null = null;
let skipNextReloadSuccess = false;

router.on('success', (event) => {
    const url = event.detail?.page?.url;
    if (!url) {
        return;
    }

    // Don't reload on the very first Inertia load.
    if (lastVisitedUrl === null) {
        lastVisitedUrl = url;
        return;
    }

    // If this `success` is caused by our own `router.reload()`, don't schedule another reload.
    if (skipNextReloadSuccess) {
        skipNextReloadSuccess = false;
        lastVisitedUrl = url;
        return;
    }

    lastVisitedUrl = url;
    skipNextReloadSuccess = true;

    // Give Vue/Inertia a tick to render the new page first, then do a full
    // browser refresh so server-side props are guaranteed to be reloaded.
    window.setTimeout(() => {
        window.location.reload();
    }, 300);
});
