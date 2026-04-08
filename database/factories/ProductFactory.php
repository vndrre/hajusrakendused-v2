<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::query()->inRandomOrder()->value('id'),
            'name' => fake()->words(2, true),
            'description' => fake()->sentence(12),
            'price' => fake()->randomFloat(2, 9, 1499),
            'image' => 'https://picsum.photos/seed/product-'.fake()->unique()->numberBetween(1, 9999).'/600/380',
            'quantity' => fake()->numberBetween(0, 30),
        ];
    }
}
