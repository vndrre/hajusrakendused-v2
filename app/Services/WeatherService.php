<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class WeatherService
{
    protected string $apiKey;
    protected string $baseUrl = 'https://api.openweathermap.org/data/2.5/weather';

    public function __construct()
    {
        $this->apiKey = config('services.openweather.api_key');
    }

    public function getWeather(string $city, string $country = ''): array
    {
        $location = $city . ($country ? ',' . $country : '');

        $cacheKey = 'weather_' . md5($location);

        return Cache::remember($cacheKey, now()->addMinutes(30), function () use ($location) {
            $response = Http::get($this->baseUrl, [
                'q' => $location,
                'appid' => $this->apiKey,
                'units' => 'metric',
                'lang' => 'en',
            ]);

            if ($response->successful()) {
                return $response->json();
            }

            throw new \Exception('Unable to fetch weather data');
        });
    }
}