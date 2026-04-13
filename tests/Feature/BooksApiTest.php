<?php

use App\Models\MyFavoriteSubject;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;

uses(RefreshDatabase::class);

test('can create a book via JSON API', function (): void {
    $user = User::factory()->create();
    $this->actingAs($user);

    $bookData = [
        'title' => 'Dune',
        'image' => 'https://picsum.photos/seed/dune/600/380',
        'description' => 'A science fiction novel.',
        'author' => 'Frank Herbert',
        'publication_year' => 1965,
    ];

    $response = $this->postJson('/books', $bookData);
    $created = $response->json();

    $response->assertStatus(201)
        ->assertJsonFragment([
            'title' => $bookData['title'],
            'author' => $bookData['author'],
            'publication_year' => $bookData['publication_year'],
        ]);

    expect($created['image'])->toBe($bookData['image']);

    $this->assertDatabaseHas('my_favorite_subject', [
        'user_id' => $user->id,
        'title' => $bookData['title'],
        'image' => $bookData['image'],
        'description' => $bookData['description'],
        'author' => $bookData['author'],
        'publication_year' => $bookData['publication_year'],
    ]);
});

test('supports search, filtering, sorting, limit and caches responses', function (): void {
    Cache::flush();

    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    $this->actingAs($user);

    $bookA = MyFavoriteSubject::factory()->create([
        'user_id' => $user->id,
        'title' => 'Dune',
        'description' => 'A science fiction novel.',
        'author' => 'Frank Herbert',
        'publication_year' => 1965,
    ]);
    $bookB = MyFavoriteSubject::factory()->create([
        'user_id' => $user->id,
        'title' => 'Dune Messiah',
        'description' => 'Second novel in the series.',
        'author' => 'Frank Herbert',
        'publication_year' => 1969,
    ]);

    $bookC = MyFavoriteSubject::factory()->create([
        'user_id' => $otherUser->id,
        'title' => 'Unknown Book',
        'description' => 'Something else.',
        'author' => 'Some Other Author',
        'publication_year' => 2001,
    ]);

    // Search + mine filter (q should be case-insensitive).
    $firstResponse = $this->getJson('/books?mine=1&q=dUnE%20mEsSiAh&limit=10&sort=created_at&direction=desc');
    $firstResponse->assertStatus(200)
        ->assertJsonPath('meta.total', 1)
        ->assertJsonPath('meta.cached', false)
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.id', $bookB->id);

    // Same query again should be cached.
    $secondResponse = $this->getJson('/books?mine=1&q=dUnE%20mEsSiAh&limit=10&sort=created_at&direction=desc');
    $secondResponse->assertStatus(200)
        ->assertJsonPath('meta.cached', true);

    // Author filter + sort + limit (author filter should be case-insensitive).
    $thirdResponse = $this->getJson('/books?mine=0&author=hErBeRt&sort=publication_year&direction=desc&limit=1');
    $thirdResponse->assertStatus(200)
        ->assertJsonCount(1, 'data');

    // Between A (1965) and B (1969), B should be first for desc order.
    $thirdResponse->assertJsonPath('data.0.id', $bookB->id);
});
