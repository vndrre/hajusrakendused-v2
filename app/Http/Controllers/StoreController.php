<?php

namespace App\Http\Controllers;

use App\Http\Requests\Store\SyncCartRequest;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

class StoreController extends Controller
{
    public function index(): Response
    {
        $products = Schema::hasTable('products')
            ? Product::query()
                ->latest()
                ->get(['id', 'name', 'description', 'price', 'image', 'quantity'])
            : collect();

        return Inertia::render('Store', [
            'products' => $products,
        ]);
    }

    public function cartIndex(): JsonResponse
    {
        return response()->json([
            'data' => $this->buildCartPayload(request()->user()),
        ]);
    }

    public function cartSync(SyncCartRequest $request): JsonResponse
    {
        $items = collect($request->validated('items', []));

        $requestedByProductId = $items
            ->map(fn (array $item): array => [
                'product_id' => (int) $item['productId'],
                'quantity' => (int) $item['quantity'],
            ])
            ->groupBy('product_id')
            ->map(fn (Collection $entries): int => (int) $entries->sum('quantity'));

        $requestedProductIds = $requestedByProductId->keys()->map(fn (int|string $id): int => (int) $id)->values();

        $productsById = Product::query()
            ->whereIn('id', $requestedProductIds)
            ->get(['id', 'quantity'])
            ->keyBy('id');

        $cartRowsToUpsert = $requestedProductIds
            ->map(function (int $productId) use ($productsById, $requestedByProductId, $request): ?array {
                $product = $productsById->get($productId);
                if (! $product || $product->quantity <= 0) {
                    return null;
                }

                $clampedQty = max(1, min((int) $requestedByProductId->get($productId, 1), (int) $product->quantity));

                return [
                    'user_id' => $request->user()->id,
                    'product_id' => $productId,
                    'quantity' => $clampedQty,
                    'updated_at' => now(),
                    'created_at' => now(),
                ];
            })
            ->filter()
            ->values()
            ->all();

        if ($cartRowsToUpsert !== []) {
            CartItem::query()->upsert($cartRowsToUpsert, ['user_id', 'product_id'], ['quantity', 'updated_at']);
        }

        $validProductIds = collect($cartRowsToUpsert)->pluck('product_id')->all();

        if ($validProductIds === []) {
            CartItem::query()->where('user_id', $request->user()->id)->delete();
        } else {
            CartItem::query()
                ->where('user_id', $request->user()->id)
                ->whereNotIn('product_id', $validProductIds)
                ->delete();
        }

        return response()->json([
            'data' => $this->buildCartPayload($request->user()),
        ]);
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function buildCartPayload(User $user): array
    {
        return CartItem::query()
            ->with(['product:id,name,price,image,quantity'])
            ->where('user_id', $user->id)
            ->get()
            ->map(function (CartItem $cartItem): ?array {
                $product = $cartItem->product;
                if (! $product || $product->quantity <= 0) {
                    return null;
                }

                $clampedQuantity = max(1, min((int) $cartItem->quantity, (int) $product->quantity));

                if ($clampedQuantity !== (int) $cartItem->quantity) {
                    $cartItem->quantity = $clampedQuantity;
                    $cartItem->save();
                }

                return [
                    'productId' => $product->id,
                    'name' => $product->name,
                    'price' => (float) $product->price,
                    'image' => $product->image,
                    'quantity' => $clampedQuantity,
                    'stock' => (int) $product->quantity,
                ];
            })
            ->filter()
            ->values()
            ->all();
    }
}
