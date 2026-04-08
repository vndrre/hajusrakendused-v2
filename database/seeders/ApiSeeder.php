<?php

namespace Database\Seeders;

use App\Models\MyFavoriteSubject;
use App\Models\User;
use Illuminate\Database\Seeder;

class ApiSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        /** @var list<User> $users */
        $users = User::query()
            ->orderBy('id')
            ->take(2)
            ->get()
            ->all();

        if (count($users) === 0) {
            return;
        }

        $bookSets = [
            [
                [
                    'title' => 'Dune',
                    'description' => 'A science fiction epic set on Arrakis.',
                    'author' => 'Frank Herbert',
                    'publication_year' => 1965,
                    'image' => 'https://picsum.photos/seed/api-dune/600/380',
                ],
                [
                    'title' => 'Dune Messiah',
                    'description' => 'Politics and prophecy follow the rise of Muad’Dib.',
                    'author' => 'Frank Herbert',
                    'publication_year' => 1969,
                    'image' => 'https://picsum.photos/seed/api-dune-messiah/600/380',
                ],
            ],
            [
                [
                    'title' => 'Neuromancer',
                    'description' => 'A console cowboy navigates cyberspace and corporate intrigue.',
                    'author' => 'William Gibson',
                    'publication_year' => 1984,
                    'image' => 'https://picsum.photos/seed/api-neuromancer/600/380',
                ],
                [
                    'title' => 'Snow Crash',
                    'description' => 'Two hackers collide in a sprawling metaverse.',
                    'author' => 'Neal Stephenson',
                    'publication_year' => 1992,
                    'image' => 'https://picsum.photos/seed/api-snow-crash/600/380',
                ],
            ],
        ];

        foreach ($users as $index => $user) {
            $setIndex = $index % count($bookSets);
            $books = $bookSets[$setIndex];

            foreach ($books as $book) {
                // Avoid duplicates when re-running the seeder.
                $alreadyExists = MyFavoriteSubject::query()
                    ->where('user_id', $user->id)
                    ->where('title', $book['title'])
                    ->exists();

                if ($alreadyExists) {
                    continue;
                }

                MyFavoriteSubject::query()->create([
                    'user_id' => $user->id,
                    'title' => $book['title'],
                    'image' => $book['image'],
                    'description' => $book['description'],
                    'author' => $book['author'],
                    'publication_year' => $book['publication_year'],
                ]);
            }
        }
    }
}
