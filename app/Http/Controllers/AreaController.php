<?php

namespace App\Http\Controllers;

use App\Models\Area;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AreaController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json(
            Area::query()
                ->where('user_id', $user?->id)
                ->get(),
        );
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'area' => 'required|array|min:3',
            'area.*' => 'required|array|size:2',
            'area.*.*' => 'required|numeric',
        ]);

        $user = $request->user();

        abort_unless($user, 401);

        $vertices = collect($validated['area'])
            ->map(fn ($point) => [
                floatval($point[0]),
                floatval($point[1]),
            ])
            ->toArray();

        $centroid = $this->calculateCentroid($vertices);

        $area = Area::create([
            'user_id' => $user->id,
            'name' => $validated['name'],
            'description' => $validated['description'],
            'area' => $vertices,
            'centroid_latitude' => $centroid['latitude'],
            'centroid_longitude' => $centroid['longitude'],
            'added' => now(),
        ]);

        return response()->json($area, 201);
    }

    public function show(Request $request, Area $area): JsonResponse
    {
        $user = $request->user();

        if (! $user || (string) $area->user_id !== (string) $user->id) {
            abort(404);
        }

        return response()->json($area);
    }

    public function update(Request $request, Area $area): JsonResponse
    {
        $user = $request->user();

        if (! $user || (string) $area->user_id !== (string) $user->id) {
            abort(404);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'area' => 'required|array|min:3',
            'area.*' => 'required|array|size:2',
            'area.*.*' => 'required|numeric',
        ]);

        $vertices = collect($validated['area'])
            ->map(fn ($point) => [
                floatval($point[0]),
                floatval($point[1]),
            ])
            ->toArray();

        $centroid = $this->calculateCentroid($vertices);

        $area->update([
            'name' => $validated['name'],
            'description' => $validated['description'],
            'area' => $vertices,
            'centroid_latitude' => $centroid['latitude'],
            'centroid_longitude' => $centroid['longitude'],
            'edited' => now(),
        ]);

        return response()->json($area);
    }

    public function destroy(Request $request, Area $area): JsonResponse
    {
        $user = $request->user();

        if (! $user || (string) $area->user_id !== (string) $user->id) {
            abort(404);
        }

        $area->delete();

        return response()->json(['message' => 'Area deleted successfully']);
    }

    protected function calculateCentroid(array $points): array
    {
        $count = count($points);

        if ($count === 0) {
            return ['latitude' => null, 'longitude' => null];
        }

        $sumLat = 0;
        $sumLng = 0;

        foreach ($points as $point) {
            $sumLat += $point[0];
            $sumLng += $point[1];
        }

        return [
            'latitude' => $sumLat / $count,
            'longitude' => $sumLng / $count,
        ];
    }
}
