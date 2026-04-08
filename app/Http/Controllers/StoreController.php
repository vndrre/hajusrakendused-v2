<?php

namespace App\Http\Controllers;

use App\Models\Product;
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
}
