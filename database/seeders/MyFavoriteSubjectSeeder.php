<?php

namespace Database\Seeders;

use App\Models\MyFavoriteSubject;
use Illuminate\Database\Seeder;

class MyFavoriteSubjectSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create some initial book rows so the Books API has data to display.
        // The factory picks an existing user_id.
        MyFavoriteSubject::factory()->count(15)->create();
    }
}
