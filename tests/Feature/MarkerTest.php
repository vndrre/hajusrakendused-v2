<?php

use App\Models\Marker;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('can create marker', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $markerData = [
        'name' => 'Test Marker',
        'latitude' => 59.4370,
        'longitude' => 24.7536,
        'description' => 'Test description',
    ];

    $response = $this->postJson('/api/markers', $markerData);

    $response->assertStatus(201)
        ->assertJson($markerData);

    $this->assertDatabaseHas('markers', [
        ...$markerData,
        'user_id' => $user->id,
    ]);
});

test('can list markers', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    Marker::factory()->for($user)->count(3)->create();
    $otherUser = User::factory()->create();
    Marker::factory()->for($otherUser)->count(2)->create();

    $response = $this->getJson('/api/markers');

    $response->assertStatus(200)
        ->assertJsonCount(3);
});

test('can update marker', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $marker = Marker::factory()->for($user)->create();

    $updatedData = [
        'name' => 'Updated Marker',
        'latitude' => 60.0000,
        'longitude' => 25.0000,
        'description' => 'Updated description',
    ];

    $response = $this->putJson("/api/markers/{$marker->id}", $updatedData);

    $response->assertStatus(200)
        ->assertJson($updatedData);

    $this->assertDatabaseHas('markers', [
        ...$updatedData,
        'user_id' => $user->id,
    ]);
});

test('can delete marker', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $marker = Marker::factory()->for($user)->create();

    $response = $this->deleteJson("/api/markers/{$marker->id}");

    $response->assertStatus(200);

    $this->assertDatabaseMissing('markers', ['id' => $marker->id]);
});
