<?php

namespace App\Http\Controllers;

use App\Models\Marker;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MarkerController extends Controller
{
    public function index(Request $request): \Inertia\Response
    {
        $user = $request->user();

        if (! $user) {
            return Inertia::render('Map', [
                'markers' => [],
            ]);
        }

        return Inertia::render('Map', [
            'markers' => Marker::query()
                ->where('user_id', $user->id)
                ->get(),
        ]);
    }

    public function apiIndex(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json(
            Marker::query()
                ->where('user_id', $user?->id)
                ->get(),
        );
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'description' => 'nullable|string|max:1000',
        ]);

        $user = $request->user();

        abort_unless($user, 401);

        $marker = Marker::create([
            'user_id' => $user->id,
            'name' => $validated['name'],
            'latitude' => $validated['latitude'],
            'longitude' => $validated['longitude'],
            'description' => $validated['description'],
            'added' => now(),
        ]);

        return response()->json($marker, 201);
    }

    public function show(Request $request, Marker $marker): JsonResponse
    {
        $user = $request->user();

        if (! $user || (string) $marker->user_id !== (string) $user->id) {
            abort(404);
        }

        return response()->json($marker);
    }

    public function update(Request $request, Marker $marker): JsonResponse
    {
        $user = $request->user();

        if (! $user || (string) $marker->user_id !== (string) $user->id) {
            abort(404);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'description' => 'nullable|string|max:1000',
        ]);

        $marker->update([
            'name' => $validated['name'],
            'latitude' => $validated['latitude'],
            'longitude' => $validated['longitude'],
            'description' => $validated['description'],
            'edited' => now(),
        ]);

        return response()->json($marker);
    }

    public function destroy(Marker $marker): JsonResponse
    {
        $user = request()->user();

        if (! $user || (string) $marker->user_id !== (string) $user->id) {
            abort(404);
        }

        $marker->delete();

        return response()->json(['message' => 'Marker deleted successfully']);
    }
}
