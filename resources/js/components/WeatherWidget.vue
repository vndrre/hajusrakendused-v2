<script setup lang="ts">
    import { usePage } from '@inertiajs/vue3';
    import axios from 'axios';
    import { onMounted, ref } from 'vue';

    interface WeatherData {
        name: string;
        sys: { country: string };
        weather: Array<{ icon: string; description: string }>;
        main: { temp: number; feels_like: number; humidity: number };
        wind: { speed: number };
        clouds?: { all: number };
    }

    const page = usePage<{
        city?: string;
        country?: string;
        auth?: { user?: { weather_city?: string | null; weather_country?: string | null } };
    }>();

    const searchCity = ref<string>(String(page.props.city ?? page.props.auth?.user?.weather_city ?? 'Tallinn'));
    const searchCountry = ref<string>(String(page.props.country ?? page.props.auth?.user?.weather_country ?? 'EE'));
    const weather = ref<WeatherData | null>(null);
    const loading = ref(false);
    const error = ref('');

    const WEATHER_CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes
    const hashString = (input: string): string => {
        // FNV-1a 32-bit (small deterministic hash for localStorage keys)
        let hash = 0x811c9dc5;
        for (let i = 0; i < input.length; i++) {
            hash ^= input.charCodeAt(i);
            hash = (hash * 0x01000193) >>> 0;
        }
        return hash.toString(16);
    };

    const getWeatherCacheKey = (city: string, country: string): string => {
        const normalizedCity = city.trim().toLowerCase();
        const normalizedCountry = country.trim().toUpperCase();
        const location = normalizedCountry ? `${normalizedCity},${normalizedCountry}` : normalizedCity;

        return `weather_cache_${hashString(location)}`;
    };

    interface WeatherCachePayload {
        savedAt: number;
        data: WeatherData;
    }

    const isWeatherData = (value: unknown): value is WeatherData => {
        if (!value || typeof value !== 'object') {
            return false;
        }

        const candidate = value as Partial<WeatherData> & {
            weather?: Array<{ icon?: unknown; description?: unknown }>;
            main?: { temp?: unknown; feels_like?: unknown; humidity?: unknown };
            wind?: { speed?: unknown };
        };

        const firstWeather = candidate.weather?.[0];

        return (
            typeof candidate.name === 'string' &&
            typeof candidate.sys?.country === 'string' &&
            Array.isArray(candidate.weather) &&
            candidate.weather.length > 0 &&
            typeof firstWeather?.icon === 'string' &&
            typeof firstWeather?.description === 'string' &&
            typeof candidate.main?.temp === 'number' &&
            typeof candidate.main?.feels_like === 'number' &&
            typeof candidate.main?.humidity === 'number' &&
            typeof candidate.wind?.speed === 'number'
        );
    };

    const readWeatherCachePayload = (cacheKey: string): WeatherCachePayload | null => {
        if (typeof window === 'undefined') return null;

        try {
            const raw = window.localStorage.getItem(cacheKey);
            if (!raw) return null;

            const parsed = JSON.parse(raw) as WeatherCachePayload;
            if (!parsed || typeof parsed.savedAt !== 'number' || !isWeatherData(parsed.data)) return null;

            return parsed;
        } catch {
            return null;
        }
    };

    const loadWeatherFromCache = (cacheKey: string): WeatherData | null => {
        const payload = readWeatherCachePayload(cacheKey);
        if (!payload) return null;

        const isFresh = Date.now() - payload.savedAt < WEATHER_CACHE_TTL_MS;
        return isFresh ? payload.data : null;
    };

    const saveWeatherToCache = (cacheKey: string, data: WeatherData): void => {
        if (typeof window === 'undefined') return;

        const payload: WeatherCachePayload = {
            savedAt: Date.now(),
            data,
        };

        try {
            window.localStorage.setItem(cacheKey, JSON.stringify(payload));
        } catch {
            // If localStorage is unavailable/quota exceeded, we can still function normally.
        }
    };

    const persistSelectionToDb = async (city: string, country: string): Promise<void> => {
        try {
            await axios.post('/api/weather/selection', {
                city,
                country: country.trim() ? country.trim() : null,
            });
        } catch (err) {
            // Weather rendering should not fail if persistence fails.
            console.error('Failed to persist weather selection:', err);
        }
    };

    const countryOptions = [
        { code: 'EE', name: 'Estonia' },
        { code: 'FI', name: 'Finland' },
        { code: 'SE', name: 'Sweden' },
        { code: 'LV', name: 'Latvia' },
        { code: 'LT', name: 'Lithuania' },
        { code: 'PL', name: 'Poland' },
        { code: 'DE', name: 'Germany' },
        { code: 'GB', name: 'United Kingdom' },
        { code: 'US', name: 'United States' },
        { code: 'JP', name: 'Japan' },
    ];

    const fetchWeather = async (city: string, country: string) => {
        loading.value = true;
        error.value = '';

        try {
            const normalizedCity = city.trim();
            const normalizedCountry = country.trim();
            const cacheKey = getWeatherCacheKey(normalizedCity, normalizedCountry);

            const cached = loadWeatherFromCache(cacheKey);
            if (cached) {
                await persistSelectionToDb(normalizedCity, normalizedCountry);
                weather.value = isWeatherData(cached) ? cached : null;

                if (!weather.value) {
                    error.value = 'Ilmaandmete hankimine ebaõnnestus';
                }

                return;
            }

            const response = await axios.get('/api/weather', {
                params: { city: normalizedCity, country: normalizedCountry },
            });

            weather.value = isWeatherData(response.data) ? response.data : null;
            if (weather.value) {
                saveWeatherToCache(cacheKey, weather.value);
            } else {
                error.value = 'Ilmaandmete hankimine ebaõnnestus';
            }
        } catch (err) {
            console.error(err);

            // If the API fails, fall back to stale cached data (if any) instead of leaving the widget blank.
            try {
                const normalizedCity = city.trim();
                const normalizedCountry = country.trim();
                const cacheKey = getWeatherCacheKey(normalizedCity, normalizedCountry);
                const payload = readWeatherCachePayload(cacheKey);
                if (payload?.data && isWeatherData(payload.data)) {
                    await persistSelectionToDb(normalizedCity, normalizedCountry);
                    weather.value = payload.data;
                    error.value = '';
                    return;
                }
            } catch {
                // ignore
            }

            error.value = 'Ilmaandmete hankimine ebaõnnestus';
        } finally {
            loading.value = false;
        }
    };

    const searchWeather = () => {
        if (searchCity.value.trim()) {
            fetchWeather(searchCity.value.trim(), searchCountry.value.trim());
        }
    };

    onMounted(() => {
        fetchWeather(searchCity.value, searchCountry.value);
    });
</script>

<template>
    <div class="relative h-full overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-100 p-1 shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
        <div
            class="h-full rounded-[calc(theme(borderRadius.3xl)-2px)] bg-white p-4 dark:bg-zinc-950"
        >
            <div class="mb-4 flex items-center justify-between">
                <div>
                    <p class="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">Live weather</p>
                    <h2 class="text-2xl font-bold text-zinc-900 dark:text-white">Forecast Overview</h2>
                </div>
                <div class="hidden rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 sm:block">
                    OpenWeather
                </div>
            </div>

            <form @submit.prevent="searchWeather" class="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto_auto]">
                <input
                    v-model="searchCity"
                    type="text"
                    placeholder="City (for example: Tallinn)"
                    class="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 shadow-sm transition focus:border-zinc-400 focus:outline-none focus:ring-4 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:border-zinc-500 dark:focus:ring-zinc-500/30"
                />
                <select
                    v-model="searchCountry"
                    class="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 shadow-sm transition focus:border-zinc-400 focus:outline-none focus:ring-4 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:border-zinc-500 dark:focus:ring-zinc-500/30 sm:w-52"
                >
                    <option
                        v-for="country in countryOptions"
                        :key="country.code"
                        :value="country.code"
                    >
                        {{ country.name }} ({{ country.code }})
                    </option>
                </select>
                <button
                    type="submit"
                    :disabled="loading"
                    class="cursor-pointer rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-zinc-900/20 transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
                >
                    Search
                </button>
            </form>

            <div v-if="loading" class="flex min-h-52 items-center justify-center">
                <div class="h-10 w-10 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900 dark:border-zinc-700 dark:border-t-zinc-100"></div>
            </div>

            <div v-else-if="error" class="rounded-2xl border border-zinc-300 bg-zinc-100 p-4 text-center text-sm font-medium text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100">
                {{ error }}
            </div>

            <div v-else-if="weather" class="space-y-4">
                <div class="flex justify-center items-center gap-3 rounded-2xl bg-zinc-100 p-3 dark:bg-zinc-900 sm:flex-row sm:items-center sm:justify-between">
                    <div class="flex items-center gap-3">
                        <div class="rounded-2xl bg-white p-1.5 shadow-sm dark:bg-zinc-950">
                            <img
                                :src="`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`"
                                :alt="weather.weather[0].description"
                                class="h-12 w-12"
                            />
                        </div>
                        <div>
                            <h3 class="text-xl font-bold text-zinc-900 dark:text-white">
                                {{ weather.name }}, {{ weather.sys.country }}
                            </h3>
                            <p class="text-sm capitalize text-zinc-500 dark:text-zinc-300">
                                {{ weather.weather[0].description }}
                            </p>
                        </div>
                    </div>

                    <div class="text-left sm:text-right">
                        <p class="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Current temp</p>
                        <p class="text-3xl font-bold text-zinc-900 dark:text-white">{{ Math.round(weather.main.temp) }}°C</p>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-3 md:grid-cols-4">
                    <div class="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-900">
                        <p class="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Feels like</p>
                        <p class="mt-1 text-lg font-semibold text-zinc-900 dark:text-white">
                            {{ Math.round(weather.main.feels_like) }}°C
                        </p>
                    </div>
                    <div class="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-900">
                        <p class="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Humidity</p>
                        <p class="mt-1 text-lg font-semibold text-zinc-900 dark:text-white">
                            {{ weather.main.humidity }}%
                        </p>
                    </div>
                    <div class="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-900">
                        <p class="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Wind</p>
                        <p class="mt-1 text-lg font-semibold text-zinc-900 dark:text-white">
                            {{ weather.wind.speed }} m/s
                        </p>
                    </div>
                    <div class="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-900">
                        <p class="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Clouds</p>
                        <p class="mt-1 text-lg font-semibold text-zinc-900 dark:text-white">
                            {{ weather.clouds?.all ?? 0 }}%
                        </p>
                    </div>
                </div>
            </div>

            <div v-else class="rounded-2xl border border-dashed border-zinc-300 bg-zinc-100 p-6 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
                Insert city, to see weather information
            </div>
        </div>
    </div>
</template>

