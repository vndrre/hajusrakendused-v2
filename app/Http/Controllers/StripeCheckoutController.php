<?php

namespace App\Http\Controllers;

use App\Http\Requests\Stripe\CreateCheckoutSessionRequest;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class StripeCheckoutController extends Controller
{
    public function createCheckoutSession(CreateCheckoutSessionRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $secretKey = config('stripe.secret_key');
        if (! is_string($secretKey) || $secretKey === '') {
            return response()->json(['message' => 'Stripe is not configured (missing STRIPE_SECRET_KEY).'], 500);
        }

        $currency = (string) config('stripe.currency', 'usd');

        // Use the current request host so Stripe redirects back to the same
        // origin (important for host-only session cookies).
        $baseUrl = rtrim($request->getSchemeAndHttpHost(), '/');
        $successUrl = $baseUrl.'/store?stripe=success&session_id={CHECKOUT_SESSION_ID}';
        $cancelUrl = $baseUrl.'/store?stripe=cancel';

        $productIds = collect($validated['items'])->pluck('productId')->values()->all();
        $products = Product::query()->whereIn('id', $productIds)->get()->keyBy('id');

        $subtotalCents = 0;
        $lineItemsFormParams = [];
        $lineIndex = 0;

        foreach ($validated['items'] as $item) {
            $productId = (int) $item['productId'];
            $quantity = (int) $item['quantity'];

            $product = $products->get($productId);
            if (! $product) {
                continue;
            }

            $unitAmountCents = (int) round(((float) $product->price) * 100);
            if ($unitAmountCents <= 0) {
                continue;
            }

            $subtotalCents += $unitAmountCents * $quantity;

            $lineItemsFormParams["line_items[{$lineIndex}][quantity]"] = (string) $quantity;
            $lineItemsFormParams["line_items[{$lineIndex}][price_data][currency]"] = $currency;
            $lineItemsFormParams["line_items[{$lineIndex}][price_data][unit_amount]"] = (string) $unitAmountCents;
            $lineItemsFormParams["line_items[{$lineIndex}][price_data][product_data][name]"] = (string) $product->name;
            $lineItemsFormParams["line_items[{$lineIndex}][price_data][product_data][description]"] = (string) $product->description;

            $lineIndex++;
        }

        if ($lineIndex === 0) {
            return response()->json(['message' => 'No valid cart items found.'], 422);
        }

        // UI charges VAT (22%) on top of subtotal, so we reflect the same calculation here.
        $vatCents = (int) round($subtotalCents * 22 / 100);
        if ($vatCents > 0) {
            $lineItemsFormParams["line_items[{$lineIndex}][quantity]"] = '1';
            $lineItemsFormParams["line_items[{$lineIndex}][price_data][currency]"] = $currency;
            $lineItemsFormParams["line_items[{$lineIndex}][price_data][unit_amount]"] = (string) $vatCents;
            $lineItemsFormParams["line_items[{$lineIndex}][price_data][product_data][name]"] = 'VAT (22%)';
            $lineItemsFormParams["line_items[{$lineIndex}][price_data][product_data][description]"] = 'Value added tax';
        }

        $customer = $validated['customer'];

        $formParams = [
            'mode' => 'payment',
            'success_url' => $successUrl,
            'cancel_url' => $cancelUrl,
            'payment_method_types[0]' => 'card',
            'customer_email' => (string) $customer['email'],
        ];

        $metadata = [
            'user_id' => (string) $request->user()?->id,
        ];

        $formParams['metadata[user_id]'] = $metadata['user_id'];
        $formParams['metadata[cart]'] = json_encode($validated['items']);

        $response = Http::withToken($secretKey)->asForm()->post(
            'https://api.stripe.com/v1/checkout/sessions',
            array_merge($formParams, $lineItemsFormParams),
        );

        if ($response->failed()) {
            return response()->json([
                'message' => 'Stripe checkout session could not be created.',
                'stripe' => $response->json(),
            ], 502);
        }

        /** @var array<string, mixed> $data */
        $data = $response->json();

        return response()->json([
            'id' => $data['id'] ?? null,
            'url' => $data['url'] ?? null,
        ]);
    }

    public function verifyCheckoutSession(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'session_id' => ['required', 'string', 'max:255'],
        ]);

        $secretKey = config('stripe.secret_key');
        if (! is_string($secretKey) || $secretKey === '') {
            return response()->json(['message' => 'Stripe is not configured (missing STRIPE_SECRET_KEY).'], 500);
        }

        $sessionId = (string) $validated['session_id'];

        $response = Http::withToken($secretKey)->get(
            "https://api.stripe.com/v1/checkout/sessions/{$sessionId}",
        );

        if ($response->failed()) {
            return response()->json([
                'message' => 'Stripe session could not be verified.',
                'stripe' => $response->json(),
            ], 502);
        }

        /** @var array<string, mixed> $data */
        $data = $response->json();

        $paymentStatus = $data['payment_status'] ?? null;
        $paid = $paymentStatus === 'paid';

        return response()->json([
            'paid' => $paid,
            'payment_status' => $paymentStatus,
            'status' => $data['status'] ?? null,
        ]);
    }
}
