<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;

class StoreSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $userId = User::query()->value('id');

        $products = [
            [
                'name' => 'Desk Lamp',
                'description' => 'Minimal black desk lamp with warm light for focused work.',
                'price' => 49.99,
                'image' => 'https://source.unsplash.com/600x380/?desk-lamp,lighting',
                'quantity' => 12,
            ],
            [
                'name' => 'Coffee Mug',
                'description' => 'Matte ceramic mug designed for everyday use.',
                'price' => 12.50,
                'image' => 'https://source.unsplash.com/600x380/?coffee-mug,mug',
                'quantity' => 25,
            ],
            [
                'name' => 'Notebook',
                'description' => 'Hardcover notebook with premium paper and clean layout.',
                'price' => 9.90,
                'image' => 'https://source.unsplash.com/600x380/?notebook,stationery',
                'quantity' => 18,
            ],
            [
                'name' => 'Wireless Keyboard',
                'description' => 'Compact keyboard with soft tactile keys and long battery life.',
                'price' => 89.00,
                'image' => 'https://source.unsplash.com/600x380/?keyboard,wireless',
                'quantity' => 9,
            ],
            [
                'name' => 'Wireless Mouse',
                'description' => 'Ergonomic mouse with precise tracking and silent clicks.',
                'price' => 39.00,
                'image' => 'https://source.unsplash.com/600x380/?mouse,computer',
                'quantity' => 0,
            ],
            [
                'name' => 'Backpack',
                'description' => 'Water-resistant backpack with laptop sleeve and side pockets.',
                'price' => 119.00,
                'image' => 'https://source.unsplash.com/600x380/?backpack,bags',
                'quantity' => 14,
            ],
            [
                'name' => 'Headphones',
                'description' => 'Over-ear headphones with active noise cancellation.',
                'price' => 199.00,
                'image' => 'https://source.unsplash.com/600x380/?headphones,audio',
                'quantity' => 7,
            ],
            [
                'name' => 'Smartphone',
                'description' => 'Fast smartphone with OLED display and all-day battery.',
                'price' => 699.00,
                'image' => 'https://source.unsplash.com/600x380/?smartphone,phone',
                'quantity' => 6,
            ],
            [
                'name' => 'Laptop',
                'description' => 'Lightweight laptop with 16GB RAM and 1TB SSD storage.',
                'price' => 1299.00,
                'image' => 'https://source.unsplash.com/600x380/?laptop,computer',
                'quantity' => 4,
            ],
        ];

        foreach ($products as $product) {
            Product::query()->updateOrCreate(
                ['name' => $product['name']],
                [
                    'user_id' => $userId,
                    ...$product,
                ],
            );
        }
    }
}
