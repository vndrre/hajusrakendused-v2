<?php

namespace App\Http\Controllers;

use App\Services\WeatherService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WeatherController extends Controller
{
    public function __construct(
        protected WeatherService $weatherService
    ) {}

    public function show(Request $request)
    {
        $user = $request->user();

        $city = (string) $request->get('city', $user?->weather_city ?? 'Tallinn');
        $country = (string) $request->get('country', $user?->weather_country ?? 'EE');

        try {
            $weather = $this->weatherService->getWeather($city, $country);

            return Inertia::render('Weather', [
                'weather' => $weather,
                'city' => $city,
                'country' => $country,
            ]);
        } catch (\Exception $e) {
            return Inertia::render('Weather', [
                'error' => 'Unable to fetch weather data',
                'city' => $city,
                'country' => $country,
            ]);
        }
    }

    public function api(Request $request)
    {
        $request->validate([
            'city' => 'required|string|max:255',
            'country' => 'nullable|string|max:255',
        ]);

        try {
            $city = (string) $request->city;
            $country = $request->country;

            $weather = $this->weatherService->getWeather($city, (string) ($country ?? ''));

            $user = $request->user();

            if ($user) {
                $user->update([
                    'weather_city' => $city,
                    'weather_country' => $country !== null && is_string($country) && trim($country) !== '' ? trim($country) : null,
                ]);
            }

            return response()->json($weather);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Unable to fetch weather data'], 500);
        }
    }

    public function selection(Request $request): JsonResponse
    {
        $request->validate([
            'city' => 'required|string|max:255',
            'country' => 'nullable|string|max:255',
        ]);

        $user = $request->user();
        abort_unless($user, 401);

        $city = (string) $request->city;
        $country = $request->country;

        $user->update([
            'weather_city' => $city,
            'weather_country' => $country !== null && is_string($country) && trim($country) !== '' ? trim($country) : null,
        ]);

        return response()->json([
            'city' => $city,
            'country' => $country !== null && is_string($country) && trim($country) !== '' ? trim($country) : null,
        ]);
    }
}
