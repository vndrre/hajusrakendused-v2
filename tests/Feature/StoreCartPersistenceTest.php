<?php

use App\Models\CartItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('persists cart items in database and returns them across requests', function (): void {
    $user = User::factory()->create();
    $productA = Product::factory()->create([
        'name' => 'Keyboard',
        'price' => 99.99,
        'quantity' => 5,
    ]);
    $productB = Product::factory()->create([
        'name' => 'Mouse',
        'price' => 49.50,
        'quantity' => 2,
    ]);

    $this->actingAs($user)
        ->putJson('/store/cart', [
            'items' => [
                ['productId' => $productA->id, 'quantity' => 3],
                ['productId' => $productB->id, 'quantity' => 10], // should clamp to stock
            ],
        ])
        ->assertOk()
        ->assertJsonCount(2, 'data')
        ->assertJsonPath('data.0.productId', $productA->id)
        ->assertJsonPath('data.0.quantity', 3)
        ->assertJsonPath('data.1.productId', $productB->id)
        ->assertJsonPath('data.1.quantity', 2);

    expect(CartItem::query()->where('user_id', $user->id)->count())->toBe(2);
    $mouseRow = CartItem::query()->where('user_id', $user->id)->where('product_id', $productB->id)->firstOrFail();
    expect($mouseRow->quantity)->toBe(2);

    $this->actingAs($user)
        ->getJson('/store/cart')
        ->assertOk()
        ->assertJsonCount(2, 'data')
        ->assertJsonPath('data.0.productId', $productA->id)
        ->assertJsonPath('data.1.productId', $productB->id);
});

it('isolates cart items per user', function (): void {
    $userA = User::factory()->create();
    $userB = User::factory()->create();
    $product = Product::factory()->create([
        'quantity' => 7,
    ]);

    $this->actingAs($userA)->putJson('/store/cart', [
        'items' => [
            ['productId' => $product->id, 'quantity' => 2],
        ],
    ])->assertOk();

    $this->actingAs($userB)->getJson('/store/cart')
        ->assertOk()
        ->assertJsonCount(0, 'data');
});
