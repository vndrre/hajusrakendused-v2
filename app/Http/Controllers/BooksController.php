<?php

namespace App\Http\Controllers;

use App\Http\Requests\Books\ListBooksRequest;
use App\Http\Requests\Books\StoreBookRequest;
use App\Models\MyFavoriteSubject;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class BooksController extends Controller
{
    public function apiPage(Request $request): Response
    {
        return Inertia::render('Api', [
            'authUser' => $request->user()
                ? $request->user()->only(['id', 'name'])
                : null,
        ]);
    }

    public function apiIndex(ListBooksRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $mineRaw = $validated['mine'] ?? null;
        $mine = match ($mineRaw) {
            true, 'true', 1, '1', 'on' => true,
            false, 'false', 0, '0', 'off' => false,
            null => false,
            default => false,
        };
        $query = (string) ($validated['q'] ?? '');
        $queryNormalized = function_exists('mb_strtolower') ? mb_strtolower($query, 'UTF-8') : strtolower($query);
        $author = (string) ($validated['author'] ?? '');
        $publicationYear = $validated['publication_year'] ?? null;
        $limit = (int) ($validated['limit'] ?? 20);

        $sort = (string) ($validated['sort'] ?? 'created_at');
        $direction = (string) ($validated['direction'] ?? 'desc');

        $sortColumn = match ($sort) {
            'title' => 'title',
            'author' => 'author',
            'publication_year' => 'publication_year',
            'created_at' => 'created_at',
            default => 'created_at',
        };

        $cacheParams = [
            'mine' => $mine,
            'q' => $query,
            'author' => $author,
            'publication_year' => $publicationYear,
            'sort' => $sortColumn,
            'direction' => $direction,
            'limit' => $limit,
            // When mine=true the results depend on the authenticated user.
            'user_id' => $mine ? $request->user()->id : null,
        ];

        $cacheKey = 'books.api:'.md5(json_encode($cacheParams, JSON_UNESCAPED_SLASHES));
        $cacheTtlSeconds = 60;
        $wasCached = Cache::has($cacheKey);

        $payload = Cache::remember($cacheKey, now()->addSeconds($cacheTtlSeconds), function () use (
            $request,
            $mine,
            $queryNormalized,
            $author,
            $publicationYear,
            $limit,
            $sortColumn,
            $direction
        ): array {
            $baseQuery = MyFavoriteSubject::query()
                ->with(['user:id,name'])
                ->when($mine, fn ($q) => $q->where('user_id', $request->user()->id))
                ->when($author !== '', fn ($q) => $q->where('author', 'like', '%'.$author.'%'))
                ->when($publicationYear !== null, fn ($q) => $q->where('publication_year', $publicationYear))
                ->when($queryNormalized !== '', function ($q) use ($queryNormalized) {
                    $likePattern = '%'.$queryNormalized.'%';

                    $q->where(function ($inner) use ($likePattern) {
                        $inner->whereRaw('LOWER(title) LIKE ?', [$likePattern])
                            ->orWhereRaw('LOWER(description) LIKE ?', [$likePattern]);
                    });
                });

            $total = (clone $baseQuery)->count();

            $books = $baseQuery
                ->orderBy($sortColumn, $direction)
                ->limit($limit)
                ->get([
                    'id',
                    'user_id',
                    'title',
                    'image',
                    'description',
                    'author',
                    'publication_year',
                    'created_at',
                ])
                ->toArray();

            return [
                'data' => $books,
                'meta' => [
                    'total' => $total,
                    'limit' => $limit,
                ],
            ];
        });

        $payload['meta']['cached'] = $wasCached;

        return response()->json($payload);
    }

    public function apiStore(StoreBookRequest $request): JsonResponse
    {
        $validated = $request->validated();

        /** @var \Illuminate\Http\UploadedFile $uploadedImage */
        $uploadedImage = $validated['image'];
        $imagePath = $uploadedImage->store('books', 'public');
        $imageUrl = Storage::disk('public')->url($imagePath);

        $book = MyFavoriteSubject::query()->create([
            'user_id' => $request->user()->id,
            'title' => $validated['title'],
            'image' => $imageUrl,
            'description' => $validated['description'],
            'author' => $validated['author'],
            'publication_year' => $validated['publication_year'],
        ]);

        return response()->json($book->load(['user:id,name']), 201);
    }
}
