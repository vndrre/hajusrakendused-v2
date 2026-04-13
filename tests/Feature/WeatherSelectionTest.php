<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('can store weather selection for the authenticated user', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $payload = [
        'city' => 'Tallinn',
        'country' => 'EE',
    ];

    $response = $this->postJson('/weather/selection', $payload);

    $response->assertStatus(200)
        ->assertJsonFragment([
            'city' => 'Tallinn',
            'country' => 'EE',
        ]);

    $this->assertDatabaseHas('users', [
        'id' => $user->id,
        'weather_city' => 'Tallinn',
        'weather_country' => 'EE',
    ]);
});

test('can store weather selection with null country', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $payload = [
        'city' => 'Tallinn',
        'country' => null,
    ];

    $response = $this->postJson('/weather/selection', $payload);

    $response->assertStatus(200)
        ->assertJsonFragment([
            'city' => 'Tallinn',
            'country' => null,
        ]);

    $this->assertDatabaseHas('users', [
        'id' => $user->id,
        'weather_city' => 'Tallinn',
        'weather_country' => null,
    ]);
});

test('selection endpoint requires authentication', function () {
    $response = $this->postJson('/weather/selection', [
        'city' => 'Tallinn',
        'country' => 'EE',
    ]);

    $response->assertStatus(401);
});
