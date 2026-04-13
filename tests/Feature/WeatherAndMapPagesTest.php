<?php

use App\Models\User;

test('guests are redirected when visiting weather and map pages', function () {
    $this->get('/weather')->assertRedirect(route('login'));
    $this->get('/map')->assertRedirect(route('login'));
    $this->get('/store')->assertRedirect(route('login'));
    $this->get('/markers')->assertRedirect(route('login'));
});

test('authenticated users can visit weather, map and store pages', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $this->get('/weather')->assertOk();
    $this->get('/map')->assertOk();
    $this->get('/store')->assertOk();
    $this->getJson('/markers')->assertOk();
});
