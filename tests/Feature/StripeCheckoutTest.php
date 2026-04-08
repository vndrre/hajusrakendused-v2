<?php

use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;

uses(RefreshDatabase::class);

it('creates a Stripe checkout session', function (): void {
    config()->set('stripe.secret_key', 'sk_test_123');
    config()->set('stripe.currency', 'usd');
    config()->set('app.url', 'http://localhost');

    $user = User::factory()->create();

    $product = Product::factory()->create([
        'name' => 'Test Product',
        'description' => 'Test description',
        'price' => 10.00,
    ]);

    Http::fake(function ($request) {
        expect($request->url())->toBe('https://api.stripe.com/v1/checkout/sessions');

        $data = $request->data();

        expect($data['mode'] ?? null)->toBe('payment');
        expect($data['customer_email'] ?? null)->toBe('customer@example.com');

        // Cart item line
        expect($data['line_items[0][quantity]'] ?? null)->toBe('2');
        expect($data['line_items[0][price_data][unit_amount]'] ?? null)->toBe('1000'); // $10.00

        // VAT line (22%)
        expect($data['line_items[1][quantity]'] ?? null)->toBe('1');
        expect($data['line_items[1][price_data][unit_amount]'] ?? null)->toBe('440'); // 2000 * 22% = 440

        return Http::response([
            'id' => 'cs_test_123',
            'url' => 'https://checkout.stripe.com/c/pay/cs_test_123',
        ]);
    });

    $this->actingAs($user)->postJson('/api/stripe/checkout-session', [
        'customer' => [
            'firstName' => 'Test',
            'lastName' => 'Customer',
            'email' => 'customer@example.com',
            'phone' => '123456789',
        ],
        'items' => [
            [
                'productId' => $product->id,
                'quantity' => 2,
            ],
        ],
    ])->assertOk()
        ->assertJson([
            'id' => 'cs_test_123',
            'url' => 'https://checkout.stripe.com/c/pay/cs_test_123',
        ]);
});

it('verifies a Stripe checkout session payment status', function (): void {
    config()->set('stripe.secret_key', 'sk_test_123');

    $user = User::factory()->create();

    Http::fake([
        'https://api.stripe.com/v1/checkout/sessions/cs_test_123' => Http::response([
            'payment_status' => 'paid',
            'status' => 'complete',
        ]),
    ]);

    $this->actingAs($user)->getJson('/api/stripe/checkout-session-status?session_id=cs_test_123')
        ->assertOk()
        ->assertJson([
            'paid' => true,
            'payment_status' => 'paid',
            'status' => 'complete',
        ]);
});

it('returns an error when Stripe secret key is missing', function (): void {
    config()->set('stripe.secret_key', '');

    $user = User::factory()->create();
    $product = Product::factory()->create();

    $this->actingAs($user)->postJson('/api/stripe/checkout-session', [
        'customer' => [
            'firstName' => 'Test',
            'lastName' => 'Customer',
            'email' => 'customer@example.com',
            'phone' => '123456789',
        ],
        'items' => [
            [
                'productId' => $product->id,
                'quantity' => 1,
            ],
        ],
    ])->assertStatus(500)
        ->assertJsonFragment(['message' => 'Stripe is not configured (missing STRIPE_SECRET_KEY).']);
});
