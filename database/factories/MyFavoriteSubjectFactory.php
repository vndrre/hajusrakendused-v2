<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\MyFavoriteSubject>
 */
class MyFavoriteSubjectFactory extends Factory
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
            'title' => fake()->words(3, true),
            'description' => fake()->sentence(14),
            'image' => 'https://picsum.photos/seed/book-'.fake()->unique()->numberBetween(1, 9999).'/600/380',
            'author' => fake()->name(),
            'publication_year' => fake()->numberBetween(1950, 2026),
        ];
    }
}
