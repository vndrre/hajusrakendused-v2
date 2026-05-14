<?php

use App\Models\Area;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('can create area', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $areaData = [
        'name' => 'Test Area',
        'description' => 'A test polygon area',
        'area' => [
            [59.4370, 24.7536],
            [59.4380, 24.7546],
            [59.4375, 24.7556],
        ],
    ];

    $response = $this->postJson('/areas', $areaData);

    $response->assertStatus(201)
        ->assertJsonFragment([
            'name' => 'Test Area',
            'description' => 'A test polygon area',
        ]);

    $this->assertDatabaseHas('areas', [
        'name' => 'Test Area',
        'description' => 'A test polygon area',
        'user_id' => $user->id,
    ]);
});

test('can list user areas', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    Area::create([
        'user_id' => $user->id,
        'name' => 'Owned Area',
        'description' => 'Owned by the current user',
        'area' => [
            [59.4370, 24.7536],
            [59.4380, 24.7546],
            [59.4375, 24.7556],
        ],
        'added' => now(),
    ]);

    $response = $this->getJson('/areas');

    $response->assertStatus(200)
        ->assertJsonCount(1);
});
