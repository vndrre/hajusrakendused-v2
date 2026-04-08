<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MyFavoriteSubject extends Model
{
    use HasFactory;

    protected $table = 'my_favorite_subject';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'title',
        'image',
        'description',
        'author',
        'publication_year',
    ];

    protected function casts(): array
    {
        return [
            'publication_year' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
